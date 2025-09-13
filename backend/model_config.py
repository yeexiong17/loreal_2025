"""
Model Configuration for Hugging Face Pipeline
This module provides configuration options for different models and analysis strategies.
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum

class AnalysisMode(Enum):
    """Different analysis modes for cost/performance trade-offs"""
    FAST = "fast"           # Fastest, least accurate
    BALANCED = "balanced"   # Balanced speed and accuracy
    ACCURATE = "accurate"   # Most accurate, slower
    CUSTOM = "custom"       # Custom configuration

@dataclass
class ModelConfig:
    """Configuration for a specific model"""
    name: str
    model_id: str
    task: str
    device: str = "auto"
    batch_size: int = 1
    max_length: int = 512
    confidence_threshold: float = 0.5
    fallback_enabled: bool = True

@dataclass
class PipelineConfig:
    """Configuration for the entire analysis pipeline"""
    mode: AnalysisMode
    models: Dict[str, ModelConfig]
    parallel_processing: bool = True
    batch_size: int = 8
    max_workers: int = 4
    timeout_seconds: int = 30
    fallback_to_rules: bool = True

class ModelConfigManager:
    """Manages model configurations for different analysis modes"""
    
    def __init__(self):
        self.configs = self._initialize_configs()
    
    def _initialize_configs(self) -> Dict[AnalysisMode, PipelineConfig]:
        """Initialize different configuration presets"""
        return {
            AnalysisMode.FAST: PipelineConfig(
                mode=AnalysisMode.FAST,
                models={
                    "sentiment": ModelConfig(
                        name="Fast Sentiment",
                        model_id="distilbert-base-uncased-finetuned-sst-2-english",
                        task="sentiment-analysis",
                        batch_size=16,
                        confidence_threshold=0.6
                    ),
                    "spam": ModelConfig(
                        name="Rule-based Spam",
                        model_id="rule_based",
                        task="text-classification",
                        fallback_enabled=True
                    ),
                    "category": ModelConfig(
                        name="Rule-based Category",
                        model_id="rule_based",
                        task="zero-shot-classification",
                        fallback_enabled=True
                    ),
                    "quality": ModelConfig(
                        name="Rule-based Quality",
                        model_id="rule_based",
                        task="text-classification",
                        fallback_enabled=True
                    )
                },
                parallel_processing=True,
                batch_size=16,
                max_workers=2,
                timeout_seconds=10
            ),
            
            AnalysisMode.BALANCED: PipelineConfig(
                mode=AnalysisMode.BALANCED,
                models={
                    "sentiment": ModelConfig(
                        name="Balanced Sentiment",
                        model_id="cardiffnlp/twitter-roberta-base-sentiment-latest",
                        task="sentiment-analysis",
                        batch_size=8,
                        confidence_threshold=0.7
                    ),
                    "spam": ModelConfig(
                        name="Spam Detection",
                        model_id="microsoft/DialoGPT-medium",
                        task="text-classification",
                        batch_size=8,
                        confidence_threshold=0.6
                    ),
                    "category": ModelConfig(
                        name="Category Classification",
                        model_id="facebook/bart-large-mnli",
                        task="zero-shot-classification",
                        batch_size=4,
                        confidence_threshold=0.6
                    ),
                    "quality": ModelConfig(
                        name="Quality Scoring",
                        model_id="distilbert-base-uncased",
                        task="text-classification",
                        batch_size=8,
                        confidence_threshold=0.5
                    )
                },
                parallel_processing=True,
                batch_size=8,
                max_workers=4,
                timeout_seconds=20
            ),
            
            AnalysisMode.ACCURATE: PipelineConfig(
                mode=AnalysisMode.ACCURATE,
                models={
                    "sentiment": ModelConfig(
                        name="Accurate Sentiment",
                        model_id="cardiffnlp/twitter-roberta-base-sentiment-latest",
                        task="sentiment-analysis",
                        batch_size=4,
                        confidence_threshold=0.8,
                        max_length=256
                    ),
                    "spam": ModelConfig(
                        name="Advanced Spam Detection",
                        model_id="microsoft/DialoGPT-medium",
                        task="text-classification",
                        batch_size=4,
                        confidence_threshold=0.7,
                        max_length=256
                    ),
                    "category": ModelConfig(
                        name="Advanced Category",
                        model_id="facebook/bart-large-mnli",
                        task="zero-shot-classification",
                        batch_size=2,
                        confidence_threshold=0.7,
                        max_length=256
                    ),
                    "quality": ModelConfig(
                        name="Advanced Quality",
                        model_id="distilbert-base-uncased",
                        task="text-classification",
                        batch_size=4,
                        confidence_threshold=0.6,
                        max_length=256
                    )
                },
                parallel_processing=True,
                batch_size=4,
                max_workers=2,
                timeout_seconds=60
            )
        }
    
    def get_config(self, mode: AnalysisMode) -> PipelineConfig:
        """Get configuration for a specific mode"""
        return self.configs.get(mode, self.configs[AnalysisMode.BALANCED])
    
    def get_available_modes(self) -> List[AnalysisMode]:
        """Get list of available analysis modes"""
        return list(AnalysisMode)
    
    def create_custom_config(self, 
                           sentiment_model: str = "cardiffnlp/twitter-roberta-base-sentiment-latest",
                           spam_model: str = "microsoft/DialoGPT-medium",
                           category_model: str = "facebook/bart-large-mnli",
                           quality_model: str = "distilbert-base-uncased",
                           batch_size: int = 8,
                           max_workers: int = 4) -> PipelineConfig:
        """Create a custom configuration"""
        return PipelineConfig(
            mode=AnalysisMode.CUSTOM,
            models={
                "sentiment": ModelConfig(
                    name="Custom Sentiment",
                    model_id=sentiment_model,
                    task="sentiment-analysis",
                    batch_size=batch_size
                ),
                "spam": ModelConfig(
                    name="Custom Spam",
                    model_id=spam_model,
                    task="text-classification",
                    batch_size=batch_size
                ),
                "category": ModelConfig(
                    name="Custom Category",
                    model_id=category_model,
                    task="zero-shot-classification",
                    batch_size=batch_size
                ),
                "quality": ModelConfig(
                    name="Custom Quality",
                    model_id=quality_model,
                    task="text-classification",
                    batch_size=batch_size
                )
            },
            parallel_processing=True,
            batch_size=batch_size,
            max_workers=max_workers
        )

# Global configuration manager
config_manager = ModelConfigManager()

def get_analysis_config(mode: str = "balanced") -> PipelineConfig:
    """Get analysis configuration by mode name"""
    try:
        analysis_mode = AnalysisMode(mode.lower())
        return config_manager.get_config(analysis_mode)
    except ValueError:
        # Default to balanced if mode not found
        return config_manager.get_config(AnalysisMode.BALANCED)

def get_available_analysis_modes() -> List[str]:
    """Get list of available analysis mode names"""
    return [mode.value for mode in config_manager.get_available_modes()]

# Model performance estimates (comments per minute)
PERFORMANCE_ESTIMATES = {
    AnalysisMode.FAST: {
        "comments_per_minute": 1000,
        "accuracy": 0.75,
        "cost_per_1000_comments": 0.01
    },
    AnalysisMode.BALANCED: {
        "comments_per_minute": 500,
        "accuracy": 0.85,
        "cost_per_1000_comments": 0.05
    },
    AnalysisMode.ACCURATE: {
        "comments_per_minute": 200,
        "accuracy": 0.95,
        "cost_per_1000_comments": 0.15
    }
}
