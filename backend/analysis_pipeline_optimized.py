"""
Optimized Hugging Face Pipeline System for Comment Analysis
This module provides a highly optimized multi-model pipeline system with batch processing,
model caching, and parallel execution for maximum speed.
"""

import asyncio
import time
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
import logging
import threading
from concurrent.futures import ThreadPoolExecutor
import queue

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class AnalysisResult:
    """Result of a single analysis task"""
    comment_id: str
    text: str
    quality_score: float
    sentiment: str
    category: str
    is_spam: bool
    confidence_scores: Dict[str, float]
    processing_time: float

class OptimizedHuggingFacePipeline:
    """Highly optimized pipeline class with batch processing and caching"""
    
    def __init__(self, batch_size: int = 128, max_workers: int = 12):
        self.pipelines = {}
        self.models_loaded = False
        self.device = "cuda" if self._check_cuda() else "cpu"
        self.batch_size = batch_size
        self.max_workers = max_workers
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        self.model_cache = {}
        self.warmup_done = False
        self.text_cache = {}  # Cache for repeated text patterns
        self.cache_hits = 0
        self.cache_misses = 0
        
        logger.info(f"Initializing optimized pipeline on device: {self.device}")
        logger.info(f"Batch size: {batch_size}, Max workers: {max_workers}")
    
    def _check_cuda(self) -> bool:
        """Check if CUDA is available"""
        try:
            import torch
            return torch.cuda.is_available()
        except ImportError:
            return False
    
    async def load_models(self):
        """Load all required models with optimizations"""
        if self.models_loaded:
            return
        
        logger.info("Loading optimized Hugging Face models...")
        start_time = time.time()
        
        try:
            from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
            import torch
            
            # Use compatible Hugging Face models for all analysis tasks
            model_configs = {
                'sentiment': {
                    'task': 'sentiment-analysis',
                    'model': 'distilbert-base-uncased-finetuned-sst-2-english',  # Fast, compatible model
                    'fallback': 'cardiffnlp/twitter-roberta-base-sentiment-latest'
                },
                'spam': {
                    'task': 'text-classification',
                    'model': 'distilbert-base-uncased',  # Compatible model for spam detection
                    'fallback': 'microsoft/DialoGPT-medium'
                },
                'category': {
                    'task': 'zero-shot-classification',
                    'model': 'facebook/bart-large-mnli',  # Compatible model for category classification
                    'fallback': 'distilbert-base-uncased'
                },
                'quality': {
                    'task': 'text-classification',
                    'model': 'distilbert-base-uncased',  # Compatible model for quality scoring
                    'fallback': None
                }
            }
            
            # Load models in parallel with optimizations
            tasks = []
            for task_name, config in model_configs.items():
                tasks.append(self._load_optimized_model(task_name, config))
            
            await asyncio.gather(*tasks)
            
            # Warm up models with dummy data
            await self._warmup_models()
            
            self.models_loaded = True
            load_time = time.time() - start_time
            logger.info(f"All models loaded successfully in {load_time:.2f}s!")
            
        except ImportError as e:
            logger.error(f"Failed to import required libraries: {e}")
            logger.error("Please install: pip install transformers torch accelerate")
            raise
        except Exception as e:
            logger.error(f"Failed to load models: {e}")
            raise
    
    async def _load_optimized_model(self, task_name: str, config: Dict[str, Any]):
        """Load a single model with optimizations"""
        try:
            # Skip loading if model is None (use rule-based only)
            if config['model'] is None:
                self.pipelines[task_name] = None
                logger.info(f"⚡ {task_name} using rule-based only for speed")
                return
                
            from transformers import pipeline
            import torch
            
            # Use optimized settings with quantization
            model_kwargs = {
                'device': 0 if self.device == "cuda" else -1,
                'model_kwargs': {
                    'dtype': torch.float16 if self.device == "cuda" else torch.float32,
                    'low_cpu_mem_usage': True
                }
            }
            
            if task_name == 'sentiment':
                model_kwargs['return_all_scores'] = True
            
            self.pipelines[task_name] = pipeline(
                config['task'],
                model=config['model'],
                **model_kwargs
            )
            
            logger.info(f"✅ {task_name} model loaded: {config['model']}")
            
        except Exception as e:
            logger.warning(f"⚠️ Failed to load {task_name} model: {e}")
            if config.get('fallback'):
                try:
                    # Use same optimized settings for fallback
                    fallback_kwargs = {
                        'device': 0 if self.device == "cuda" else -1,
                        'model_kwargs': {
                            'dtype': torch.float16 if self.device == "cuda" else torch.float32,
                            'low_cpu_mem_usage': True
                        }
                    }
                    
                    if task_name == 'sentiment':
                        fallback_kwargs['return_all_scores'] = True
                    
                    self.pipelines[task_name] = pipeline(
                        config['task'],
                        model=config['fallback'],
                        **fallback_kwargs
                    )
                    logger.info(f"✅ {task_name} fallback model loaded: {config['fallback']}")
                except Exception as fallback_error:
                    logger.warning(f"❌ {task_name} fallback model failed: {fallback_error}")
                    self.pipelines[task_name] = None
                    logger.warning(f"❌ {task_name} model failed, using rule-based fallback")
            else:
                self.pipelines[task_name] = None
                logger.warning(f"❌ {task_name} model failed, using rule-based fallback")
    
    async def _warmup_models(self):
        """Warm up models with dummy data for faster first inference"""
        if self.warmup_done:
            return
        
        logger.info("🔥 Warming up models...")
        warmup_texts = [
            "This is a great product!",
            "I love this makeup, it's amazing.",
            "The skincare routine works perfectly.",
            "This fragrance smells wonderful.",
            "The hair care products are excellent."
        ]
        
        try:
            # Warm up each model
            for task_name, pipeline in self.pipelines.items():
                if pipeline:
                    try:
                        if task_name == 'category':
                            pipeline(warmup_texts[0], ["skincare", "makeup", "fragrance", "haircare", "general"])
                        else:
                            pipeline(warmup_texts[0])
                    except Exception as e:
                        logger.warning(f"Warmup failed for {task_name}: {e}")
            
            self.warmup_done = True
            logger.info("🔥 Model warmup completed!")
            
        except Exception as e:
            logger.warning(f"Model warmup failed: {e}")
    
    async def analyze_batch(self, comments: List[Tuple[str, str]]) -> List[AnalysisResult]:
        """Analyze a batch of comments in parallel for maximum speed"""
        if not self.models_loaded:
            await self.load_models()
        
        start_time = time.time()
        logger.info(f"🚀 Analyzing batch of {len(comments)} comments...")
        
        # Process in larger batches for better speed
        results = []
        for i in range(0, len(comments), self.batch_size):
            batch = comments[i:i + self.batch_size]
            batch_results = await self._process_batch(batch)
            results.extend(batch_results)
        
        total_time = time.time() - start_time
        comments_per_second = len(comments) / total_time if total_time > 0 else 0
        
        # Log cache statistics
        total_cache_checks = self.cache_hits + self.cache_misses
        cache_hit_rate = (self.cache_hits / total_cache_checks * 100) if total_cache_checks > 0 else 0
        
        logger.info(f"✅ Batch analysis completed: {len(comments)} comments in {total_time:.2f}s ({comments_per_second:.1f} comments/sec)")
        logger.info(f"📊 Cache stats: {self.cache_hits} hits, {self.cache_misses} misses ({cache_hit_rate:.1f}% hit rate)")
        
        return results
    
    def _get_cached_result(self, text: str) -> Optional[Dict[str, Any]]:
        """Get cached result for text if available"""
        text_hash = hash(text[:100])  # Use first 100 chars as key
        if text_hash in self.text_cache:
            self.cache_hits += 1
            return self.text_cache[text_hash]
        self.cache_misses += 1
        return None
    
    def _cache_result(self, text: str, result: Dict[str, Any]):
        """Cache result for text"""
        text_hash = hash(text[:100])  # Use first 100 chars as key
        self.text_cache[text_hash] = result
        # Limit cache size to prevent memory issues
        if len(self.text_cache) > 10000:
            # Remove oldest entries
            oldest_keys = list(self.text_cache.keys())[:1000]
            for key in oldest_keys:
                del self.text_cache[key]

    async def _process_batch(self, batch: List[Tuple[str, str]]) -> List[AnalysisResult]:
        """Process a single batch of comments with caching"""
        if not batch:
            return []
        
        # Extract texts and IDs
        texts = [comment[0] for comment in batch]
        ids = [comment[1] for comment in batch]
        
        # Check cache for each text
        cached_results = []
        texts_to_process = []
        indices_to_process = []
        
        for i, text in enumerate(texts):
            cached = self._get_cached_result(text)
            if cached:
                cached_results.append((i, cached))
            else:
                texts_to_process.append(text)
                indices_to_process.append(i)
        
        # Process only non-cached texts
        if texts_to_process:
            # Run all analysis tasks in parallel for non-cached texts
            tasks = [
                self._analyze_sentiment_batch(texts_to_process),
                self._analyze_spam_batch(texts_to_process),
                self._analyze_category_batch(texts_to_process),
                self._analyze_quality_batch(texts_to_process)
            ]
            
            try:
                results = await asyncio.gather(*tasks, return_exceptions=True)
                sentiment_results, spam_results, category_results, quality_results = results
            except Exception as e:
                logger.error(f"Error processing batch: {e}")
                # Return fallback results
                return [AnalysisResult(
                    comment_id=comment_id,
                    text=text,
                    quality_score=0.5,
                    sentiment="neutral",
                    category="general",
                    is_spam=False,
                    confidence_scores={'sentiment': 0.3, 'spam': 0.3, 'category': 0.3, 'quality': 0.3},
                    processing_time=0.0
                ) for text, comment_id in batch]
        else:
            # All texts were cached
            sentiment_results = spam_results = category_results = quality_results = []
            
        # Combine results from cache and processing
        batch_results = []
        processed_idx = 0
        
        for i, (text, comment_id) in enumerate(batch):
            try:
                # Check if this was cached
                cached_result = None
                for cached_idx, cached_data in cached_results:
                    if cached_idx == i:
                        cached_result = cached_data
                        break
                
                if cached_result:
                    # Use cached result
                    batch_results.append(AnalysisResult(
                        comment_id=comment_id,
                        text=text,
                        quality_score=cached_result.get('quality_score', 0.5),
                        sentiment=cached_result.get('sentiment', 'neutral'),
                        category=cached_result.get('category', 'general'),
                        is_spam=cached_result.get('is_spam', False),
                        confidence_scores=cached_result.get('confidence_scores', {'sentiment': 0.3, 'spam': 0.3, 'category': 0.3, 'quality': 0.3}),
                        processing_time=0.0
                    ))
                else:
                    # Use processed result
                    sentiment = self._process_sentiment_result(sentiment_results[processed_idx] if processed_idx < len(sentiment_results) else None, text)
                    is_spam = self._process_spam_result(spam_results[processed_idx] if processed_idx < len(spam_results) else None, text)
                    category = self._process_category_result(category_results[processed_idx] if processed_idx < len(category_results) else None, text)
                    quality_score = self._process_quality_result(quality_results[processed_idx] if processed_idx < len(quality_results) else None, text)
                    
                    confidence_scores = {
                        'sentiment': self._calculate_confidence(sentiment_results[processed_idx] if processed_idx < len(sentiment_results) else None),
                        'spam': 0.8 if is_spam else 0.7,
                        'category': self._calculate_confidence(category_results[processed_idx] if processed_idx < len(category_results) else None),
                        'quality': self._calculate_confidence(quality_results[processed_idx] if processed_idx < len(quality_results) else None)
                    }
                    
                    # Cache the result
                    result_data = {
                        'quality_score': quality_score,
                        'sentiment': sentiment,
                        'category': category,
                        'is_spam': is_spam,
                        'confidence_scores': confidence_scores
                    }
                    self._cache_result(text, result_data)
                    
                    batch_results.append(AnalysisResult(
                        comment_id=comment_id,
                        text=text,
                        quality_score=quality_score,
                        sentiment=sentiment,
                        category=category,
                        is_spam=is_spam,
                        confidence_scores=confidence_scores,
                        processing_time=0.0
                    ))
                    
                    processed_idx += 1
                    
            except Exception as e:
                logger.error(f"Error processing comment {comment_id}: {e}")
                # Add fallback result
                batch_results.append(AnalysisResult(
                    comment_id=comment_id,
                    text=text,
                    quality_score=0.5,
                    sentiment="neutral",
                    category="general",
                    is_spam=False,
                    confidence_scores={'sentiment': 0.3, 'spam': 0.3, 'category': 0.3, 'quality': 0.3},
                    processing_time=0.0
                ))
        
        return batch_results
    
    async def _analyze_sentiment_batch(self, texts: List[str]) -> List[Any]:
        """Analyze sentiment for a batch of texts"""
        try:
            if 'sentiment' in self.pipelines and self.pipelines['sentiment']:
                # Use threading for CPU-bound tasks
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    self.executor,
                    self.pipelines['sentiment'],
                    texts
                )
                return result if isinstance(result, list) else [result]
        except Exception as e:
            logger.error(f"Sentiment batch analysis error: {e}")
        return [None] * len(texts)
    
    async def _analyze_spam_batch(self, texts: List[str]) -> List[Any]:
        """Analyze spam for a batch of texts using Hugging Face model"""
        try:
            if 'spam' in self.pipelines and self.pipelines['spam']:
                # Use Hugging Face model for spam detection
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    self.executor,
                    self.pipelines['spam'],
                    texts
                )
                return result if isinstance(result, list) else [result]
            else:
                # Fallback to rule-based if model not available
                results = []
                for text in texts:
                    is_spam = self._rule_based_spam_detection(text)
                    results.append({
                        'label': 'SPAM' if is_spam else 'NOT_SPAM',
                        'score': 0.9 if is_spam else 0.1
                    })
                return results
        except Exception as e:
            logger.error(f"Spam batch analysis error: {e}")
            # Fallback to rule-based
            results = []
            for text in texts:
                is_spam = self._rule_based_spam_detection(text)
                results.append({
                    'label': 'SPAM' if is_spam else 'NOT_SPAM',
                    'score': 0.9 if is_spam else 0.1
                })
            return results
    
    async def _analyze_category_batch(self, texts: List[str]) -> List[Any]:
        """Analyze category for a batch of texts"""
        try:
            if 'category' in self.pipelines and self.pipelines['category']:
                categories = ["skincare", "makeup", "fragrance", "haircare", "general"]
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    self.executor,
                    lambda: [self.pipelines['category'](text, categories) for text in texts]
                )
                return result
        except Exception as e:
            logger.error(f"Category batch analysis error: {e}")
        return [None] * len(texts)
    
    async def _analyze_quality_batch(self, texts: List[str]) -> List[Any]:
        """Analyze quality for a batch of texts using Hugging Face model"""
        try:
            if 'quality' in self.pipelines and self.pipelines['quality']:
                # Use Hugging Face model for quality scoring
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    self.executor,
                    self.pipelines['quality'],
                    texts
                )
                return result if isinstance(result, list) else [result]
            else:
                # Fallback to rule-based if model not available
                results = []
                for text in texts:
                    quality_score = self._rule_based_quality_score(text)
                    results.append({
                        'label': 'HIGH_QUALITY' if quality_score > 0.7 else 'LOW_QUALITY' if quality_score < 0.3 else 'MEDIUM_QUALITY',
                        'score': quality_score
                    })
                return results
        except Exception as e:
            logger.error(f"Quality batch analysis error: {e}")
            # Fallback to rule-based
            results = []
            for text in texts:
                quality_score = self._rule_based_quality_score(text)
                results.append({
                    'label': 'HIGH_QUALITY' if quality_score > 0.7 else 'LOW_QUALITY' if quality_score < 0.3 else 'MEDIUM_QUALITY',
                    'score': quality_score
                })
            return results
    
    # Keep the same processing methods as the original
    def _process_sentiment_result(self, result: Any, text: str = "") -> str:
        """Process sentiment analysis result with improved neutral detection"""
        if not result:
            return "neutral"
        
        try:
            if isinstance(result, list) and len(result) > 0:
                sentiment_scores = result[0] if isinstance(result[0], list) else result
                
                # Find the best sentiment and its confidence
                best_sentiment = max(sentiment_scores, key=lambda x: x['score'])
                best_score = best_sentiment['score']
                label = best_sentiment['label'].lower()
                
                # Check for neutral sentiment with confidence threshold
                if 'neutral' in label or 'neither' in label:
                    return "neutral"
                
                # If confidence is too low, use rule-based detection
                if best_score < 0.5:  # Lower confidence threshold to reduce neutral outputs
                    return self._rule_based_sentiment_detection(text)
                
                # Check if there's a close second sentiment (indicating uncertainty)
                if len(sentiment_scores) > 1:
                    sorted_scores = sorted(sentiment_scores, key=lambda x: x['score'], reverse=True)
                    second_best_score = sorted_scores[1]['score']
                    
                    # If the difference between top 2 is small, consider it neutral
                    if best_score - second_best_score < 0.1:  # Even tighter threshold
                        return "neutral"
                
                if 'positive' in label or 'pos' in label:
                    return "positive"
                elif 'negative' in label or 'neg' in label:
                    return "negative"
                else:
                    return "neutral"
            else:
                # Single result processing
                label = result['label'].lower()
                score = result.get('score', 0.0)
                
                # Check for neutral or low confidence
                if 'neutral' in label or 'neither' in label or score < 0.6:
                    return "neutral"
                
                if 'positive' in label or 'pos' in label:
                    return "positive"
                elif 'negative' in label or 'neg' in label:
                    return "negative"
                else:
                    return "neutral"
        except Exception as e:
            logger.error(f"Error processing sentiment result: {e}")
            return "neutral"
    
    def _rule_based_sentiment_detection(self, text: str) -> str:
        """Rule-based sentiment detection as fallback for better neutral detection"""
        text_lower = text.lower().strip()
        
        # Very short or empty text is neutral
        if len(text_lower) < 3:
            return "neutral"
        
        # Neutral indicators
        neutral_indicators = [
            'ok', 'okay', 'fine', 'alright', 'average', 'normal', 'regular',
            'nothing special', 'so so', 'meh', 'whatever', 'i guess',
            'not sure', 'maybe', 'perhaps', 'could be', 'might be',
            'i think', 'i suppose', 'i believe', 'i assume'
        ]
        
        # Check for neutral indicators
        for indicator in neutral_indicators:
            if indicator in text_lower:
                return "neutral"
        
        # Positive indicators (beauty/skincare specific)
        positive_indicators = [
            'love', 'amazing', 'great', 'excellent', 'fantastic', 'wonderful',
            'perfect', 'awesome', 'brilliant', 'outstanding', 'superb',
            'beautiful', 'gorgeous', 'stunning', 'incredible', 'fabulous',
            'best', 'favorite', 'recommend', 'highly recommend', 'must have',
            'wow', 'delighted', 'thrilled', 'excited', 'satisfied', 'happy',
            'works great', 'love it', 'amazing results', 'perfect for', 'exactly what',
            'highly recommend', 'definitely buy', 'worth it', 'game changer',
            'soft', 'smooth', 'glowing', 'radiant', 'hydrated', 'moisturized'
        ]
        
        # Negative indicators (beauty/skincare specific)
        negative_indicators = [
            'hate', 'terrible', 'awful', 'horrible', 'disgusting', 'disappointed',
            'worst', 'bad', 'poor', 'disappointing', 'useless', 'waste',
            'regret', 'dislike', 'annoying', 'frustrating', 'angry', 'upset',
            'sad', 'depressed', 'unhappy', 'displeased', 'unsatisfied',
            'doesn\'t work', 'waste of money', 'not worth it', 'terrible quality',
            'broke out', 'irritated', 'dried out', 'too harsh', 'too strong',
            'didn\'t work', 'no results', 'waste of time', 'overpriced'
        ]
        
        # Count positive and negative indicators
        positive_count = sum(1 for indicator in positive_indicators if indicator in text_lower)
        negative_count = sum(1 for indicator in negative_indicators if indicator in text_lower)
        
        # If both positive and negative indicators are present, it's likely neutral
        if positive_count > 0 and negative_count > 0:
            return "neutral"
        
        # If no clear indicators, it's neutral
        if positive_count == 0 and negative_count == 0:
            return "neutral"
        
        # Return the dominant sentiment
        if positive_count > negative_count:
            return "positive"
        elif negative_count > positive_count:
            return "negative"
        else:
            return "neutral"
    
    def _process_spam_result(self, result: Any, text: str) -> bool:
        """Process spam detection result from Hugging Face model"""
        try:
            if result and isinstance(result, dict):
                label = result.get('label', '').upper()
                score = result.get('score', 0.0)
                
                # Use model result with confidence threshold
                if score > 0.6:  # Lower threshold for better detection
                    return label == 'SPAM' or 'SPAM' in label
                else:
                    # Low confidence, combine with rule-based
                    model_result = label == 'SPAM' or 'SPAM' in label
                    rule_result = self._rule_based_spam_detection(text)
                    # If both agree, use that result; otherwise use rule-based
                    return rule_result if model_result != rule_result else model_result
            else:
                # No result, use rule-based detection
                return self._rule_based_spam_detection(text)
        except Exception as e:
            logger.error(f"Error processing spam result: {e}")
            return self._rule_based_spam_detection(text)
    
    def _rule_based_spam_detection(self, text: str) -> bool:
        """Enhanced rule-based spam detection for beauty/skincare comments"""
        text_lower = text.lower().strip()
        
        # Very short comments are likely not spam
        if len(text_lower) < 5:
            return False
        
        # Spam indicators (beauty/skincare specific)
        spam_indicators = [
            'buy now', 'click here', 'free money', 'win cash', 'urgent',
            'limited time', 'act now', 'guaranteed', 'no risk', '100% free',
            'make money', 'work from home', 'get rich', 'earn cash',
            'follow me', 'subscribe', 'check out my', 'visit my',
            'dm me', 'message me', 'contact me', 'call me',
            'promo code', 'discount code', 'use code', 'save money',
            'affiliate link', 'sponsored', 'advertisement', 'promotion'
        ]
        
        # Excessive repetition patterns
        words = text_lower.split()
        if len(words) > 3:
            word_counts = {}
            for word in words:
                word_counts[word] = word_counts.get(word, 0) + 1
            
            # Check for excessive repetition
            max_repetition = max(word_counts.values())
            if max_repetition > len(words) * 0.4:  # More than 40% repetition
                return True
        
        # Check for spam indicators
        spam_count = sum(1 for indicator in spam_indicators if indicator in text_lower)
        
        # Check for excessive caps
        caps_ratio = sum(1 for c in text if c.isupper()) / len(text) if text else 0
        excessive_caps = caps_ratio > 0.7
        
        # Check for excessive punctuation
        punct_ratio = sum(1 for c in text if c in '!@#$%^&*()') / len(text) if text else 0
        excessive_punct = punct_ratio > 0.3
        
        # Check for URL patterns
        url_patterns = ['http', 'www.', '.com', '.net', '.org']
        has_urls = any(pattern in text_lower for pattern in url_patterns)
        
        # Determine if spam (more aggressive detection)
        is_spam = (
            spam_count >= 1 or  # Any spam indicator
            (excessive_caps and excessive_punct) or  # Excessive formatting
            (has_urls and len(text) < 50) or  # URLs in short text
            (excessive_caps and len(text) < 30) or  # Excessive caps in short text
            (excessive_punct and len(text) < 30)  # Excessive punctuation in short text
        )
        
        return is_spam
    
    def _process_category_result(self, result: Any, text: str) -> str:
        """Process category classification result"""
        if not result:
            return self._rule_based_category(text)
        
        try:
            if 'labels' in result and 'scores' in result:
                labels = result['labels']
                scores = result['scores']
                best_idx = scores.index(max(scores))
                return labels[best_idx]
            else:
                return self._rule_based_category(text)
        except Exception as e:
            logger.error(f"Error processing category result: {e}")
            return self._rule_based_category(text)
    
    def _rule_based_category(self, text: str) -> str:
        """Rule-based category classification as fallback"""
        text_lower = text.lower()
        
        skincare_keywords = ['skin', 'face', 'acne', 'moisturizer', 'serum', 'cleanser', 'toner', 'cream']
        makeup_keywords = ['makeup', 'lipstick', 'foundation', 'eyeshadow', 'mascara', 'blush', 'concealer']
        fragrance_keywords = ['perfume', 'cologne', 'scent', 'fragrance', 'smell', 'aroma']
        haircare_keywords = ['hair', 'shampoo', 'conditioner', 'styling', 'color', 'dye', 'cut']
        
        if any(keyword in text_lower for keyword in skincare_keywords):
            return "skincare"
        elif any(keyword in text_lower for keyword in makeup_keywords):
            return "makeup"
        elif any(keyword in text_lower for keyword in fragrance_keywords):
            return "fragrance"
        elif any(keyword in text_lower for keyword in haircare_keywords):
            return "haircare"
        else:
            return "general"
    
    def _process_quality_result(self, result: Any, text: str) -> float:
        """Process quality scoring result from Hugging Face model"""
        if not result:
            return self._rule_based_quality_score(text)
        
        try:
            if isinstance(result, dict):
                # Extract score from model result
                score = result.get('score', 0.5)
                label = result.get('label', '').lower()
                
                # Convert label-based scoring to numeric
                if 'high' in label:
                    return min(1.0, score + 0.2)
                elif 'low' in label:
                    return max(0.0, score - 0.2)
                else:  # medium
                    return score
            else:
                return self._rule_based_quality_score(text)
        except Exception as e:
            logger.error(f"Error processing quality result: {e}")
            return self._rule_based_quality_score(text)
    
    def _rule_based_quality_score(self, text: str) -> float:
        """Rule-based quality scoring as fallback"""
        score = 0.5  # Base score
        
        # Length factor
        length = len(text.strip())
        if length > 100:
            score += 0.2
        elif length > 50:
            score += 0.1
        elif length < 10:
            score -= 0.3
        
        # Complexity factors
        if any(char.isupper() for char in text):
            score += 0.05
        if any(char.isdigit() for char in text):
            score += 0.05
        if '?' in text:
            score += 0.1
        if len(text.split()) > 5:
            score += 0.1
        
        # Spam penalty
        if self._rule_based_spam_detection(text):
            score -= 0.4
        
        return max(0.0, min(1.0, score))
    
    def _calculate_confidence(self, result: Any) -> float:
        """Calculate confidence score from model result"""
        if not result:
            return 0.3
        
        try:
            if isinstance(result, list) and len(result) > 0:
                if isinstance(result[0], dict) and 'score' in result[0]:
                    return result[0]['score']
            elif isinstance(result, dict) and 'score' in result:
                return result['score']
        except Exception:
            pass
        
        return 0.7

# Global pipeline instance
pipeline_instance = None

async def get_optimized_pipeline() -> OptimizedHuggingFacePipeline:
    """Get or create the global optimized pipeline instance"""
    global pipeline_instance
    if pipeline_instance is None:
        pipeline_instance = OptimizedHuggingFacePipeline(batch_size=128, max_workers=12)
        await pipeline_instance.load_models()
    return pipeline_instance

async def analyze_comment_with_hf_optimized(comment_text: str, comment_id: str = "", analysis_id: str = "") -> Dict[str, Any]:
    """Optimized function to analyze a single comment using Hugging Face models"""
    try:
        pipeline = await get_optimized_pipeline()
        result = await pipeline.analyze_batch([(comment_text, comment_id)])
        
        if result:
            analysis_result = result[0]
            return {
                "sentiment": analysis_result.sentiment,
                "category": analysis_result.category,
                "quality_score": analysis_result.quality_score,
                "is_spam": analysis_result.is_spam,
                "confidence": analysis_result.confidence_scores,
                "processing_time": analysis_result.processing_time
            }
        else:
            raise Exception("No result returned from batch analysis")
            
    except Exception as e:
        logger.error(f"Error in optimized HF analysis: {e}")
        return {
            "sentiment": "neutral",
            "category": "general",
            "quality_score": 0.5,
            "is_spam": False,
            "confidence": {"sentiment": 0.3, "spam": 0.3, "category": 0.3, "quality": 0.3},
            "processing_time": 0.0
        }

async def analyze_batch_with_hf_optimized(comments: List[Tuple[str, str]]) -> List[Dict[str, Any]]:
    """Analyze a batch of comments using optimized Hugging Face models"""
    try:
        pipeline = await get_optimized_pipeline()
        results = await pipeline.analyze_batch(comments)
        
        return [{
            "comment_id": result.comment_id,
            "sentiment": result.sentiment,
            "category": result.category,
            "quality_score": result.quality_score,
            "is_spam": result.is_spam,
            "confidence": result.confidence_scores,
            "processing_time": result.processing_time
        } for result in results]
        
    except Exception as e:
        logger.error(f"Error in optimized HF batch analysis: {e}")
        return [{
            "comment_id": comment_id,
            "sentiment": "neutral",
            "category": "general",
            "quality_score": 0.5,
            "is_spam": False,
            "confidence": {"sentiment": 0.3, "spam": 0.3, "category": 0.3, "quality": 0.3},
            "processing_time": 0.0
        } for _, comment_id in comments]
