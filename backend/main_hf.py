"""
Hugging Face Only Backend
This version uses only Hugging Face models for analysis - no OpenAI API calls
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
import json
import asyncio
from datetime import datetime
from typing import List, Dict, Any
import uuid
import re
import time
from analysis_pipeline_optimized import analyze_comment_with_hf_optimized, analyze_batch_with_hf_optimized
from model_config import get_analysis_config, get_available_analysis_modes, AnalysisMode

# Initialize FastAPI app
app = FastAPI(
    title="L'Oréal Comment Analysis API (Hugging Face)",
    description="AI-powered analysis using Hugging Face models only",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for demo
comments_data = []
analysis_results = {}
current_analysis_id = None
cancelled_analyses = set()  # Track cancelled analyses

# Analysis configuration
current_analysis_mode = "balanced"  # Default mode
analysis_config = get_analysis_config(current_analysis_mode)

def log_analysis_step(step: str, details: str = "", comment_id: str = "", analysis_id: str = ""):
    """Enhanced logging function for analysis steps"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
    prefix = f"[{timestamp}]"
    
    if analysis_id:
        prefix += f" [Analysis-{analysis_id[:8]}]"
    if comment_id:
        prefix += f" [Comment-{comment_id[:8]}]"
    
    print(f"{prefix} {step}")
    if details:
        print(f"{' ' * (len(prefix) + 1)} └─ {details}")

async def analyze_comment_with_hf_only(comment_text: str, comment_id: str = "", analysis_id: str = "") -> Dict[str, Any]:
    """Analyze a single comment using ONLY Hugging Face models"""
    log_analysis_step("🔍 STARTING HF ANALYSIS", f"Text: '{comment_text[:50]}{'...' if len(comment_text) > 50 else ''}'", comment_id, analysis_id)
    log_analysis_step("🤖 USING HUGGING FACE ONLY", f"Mode: {current_analysis_mode}, Config: {analysis_config.mode.value}", comment_id, analysis_id)
    
    try:
        start_time = time.time()
        
        # Use optimized Hugging Face pipeline
        result = await analyze_comment_with_hf_optimized(comment_text, comment_id, analysis_id)
        
        processing_time = time.time() - start_time
        
        log_analysis_step("📥 RECEIVED HF RESPONSE", f"Processing time: {processing_time:.2f}s, Result: {result}", comment_id, analysis_id)
        
        # Format result to match expected structure
        analysis_result = {
            "sentiment": result.get("sentiment", "neutral"),
            "category": result.get("category", "general"),
            "quality_score": float(result.get("quality_score", 0.5)),
            "is_spam": bool(result.get("is_spam", False)),
            "confidence": result.get("confidence", {}).get("sentiment", 0.7),
            "processing_time": processing_time,
            "model_source": "huggingface"  # Mark as HF source
        }
        
        log_analysis_step("🎯 HF ANALYSIS COMPLETE", f"Sentiment: {analysis_result['sentiment']}, Category: {analysis_result['category']}, Quality: {analysis_result['quality_score']:.2f}, Spam: {analysis_result['is_spam']}", comment_id, analysis_id)
        
        return analysis_result
        
    except Exception as e:
        log_analysis_step("❌ HF ANALYSIS ERROR", f"Error: {e}", comment_id, analysis_id)
        
        # Fallback to simple rule-based analysis
        fallback_result = {
            "sentiment": "neutral",
            "category": "general", 
            "quality_score": 0.5,
            "is_spam": False,
            "confidence": 0.3,
            "processing_time": 0.0,
            "model_source": "rule_based_fallback"
        }
        
        log_analysis_step("🆘 RULE-BASED FALLBACK", f"Using rule-based analysis: {fallback_result}", comment_id, analysis_id)
        
        return fallback_result

def process_csv_file(file_path: str) -> List[Dict[str, Any]]:
    """Process CSV file and return structured data"""
    log_analysis_step("📁 PROCESSING CSV FILE", f"File: {file_path}")
    
    try:
        df = pd.read_csv(file_path)
        log_analysis_step("📊 CSV LOADED", f"Rows: {len(df)}, Columns: {list(df.columns)}")
        
        processed_comments = []
        
        for index, row in df.iterrows():
            comment = {
                "comment_id": str(row.get('commentId', f'comment_{index}')),
                "text_original": str(row.get('textOriginal', '')),
                "video_id": str(row.get('videoId', '')),
                "author_id": str(row.get('authorId', '')),
                "like_count": int(row.get('likeCount', 0)) if pd.notna(row.get('likeCount')) else 0,
                "published_at": str(row.get('publishedAt', '')),
                "analysis": None  # Will be filled during analysis
            }
            processed_comments.append(comment)
            
            if (index + 1) % 100 == 0:  # Log every 100 comments
                log_analysis_step("📝 PROCESSING PROGRESS", f"Processed {index + 1}/{len(df)} comments")
        
        log_analysis_step("✅ CSV PROCESSING COMPLETE", f"Total comments processed: {len(processed_comments)}")
        return processed_comments
        
    except Exception as e:
        log_analysis_step("❌ CSV PROCESSING ERROR", f"Error: {e}")
        return []

# API Routes
@app.get("/")
async def root():
    return {"message": "L'Oréal AI Comment Analysis API (Hugging Face) is running", "model_source": "huggingface"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "ai_enabled": True, 
        "analysis_mode": current_analysis_mode,
        "model_source": "huggingface",
        "hf_available": True
    }

@app.get("/api/analysis/modes")
async def get_analysis_modes():
    """Get available analysis modes"""
    return {
        "modes": get_available_analysis_modes(),
        "current_mode": current_analysis_mode,
        "model_source": "huggingface",
        "performance_estimates": {
            "fast": {"comments_per_minute": 2000, "accuracy": 0.75, "cost_per_1000": 0.0},
            "balanced": {"comments_per_minute": 1200, "accuracy": 0.85, "cost_per_1000": 0.0},
            "accurate": {"comments_per_minute": 800, "accuracy": 0.95, "cost_per_1000": 0.0}
        }
    }

@app.post("/api/analysis/mode")
async def set_analysis_mode(request: dict):
    """Set the analysis mode"""
    global current_analysis_mode, analysis_config
    
    mode = request.get("mode", "balanced")
    if mode not in get_available_analysis_modes():
        raise HTTPException(status_code=400, detail=f"Invalid mode. Available modes: {get_available_analysis_modes()}")
    
    current_analysis_mode = mode
    analysis_config = get_analysis_config(mode)
    
    log_analysis_step("⚙️ ANALYSIS MODE CHANGED", f"Mode: {mode} (Hugging Face)")
    
    return {"message": f"Analysis mode set to {mode} (Hugging Face)", "mode": mode, "model_source": "huggingface"}

@app.post("/api/comments/upload")
async def upload_comments(file: UploadFile = File(...)):
    """Upload and process CSV file"""
    global comments_data
    
    log_analysis_step("🚀 FILE UPLOAD STARTED", f"Filename: {file.filename}, Size: {file.size} bytes")
    
    try:
        # Save uploaded file
        file_path = f"uploads/{file.filename}"
        os.makedirs("uploads", exist_ok=True)
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        log_analysis_step("💾 FILE SAVED", f"Saved to: {file_path}")
        
        # Process CSV
        comments_data = process_csv_file(file_path)
        
        result = {
            "videos_processed": len(set(c["video_id"] for c in comments_data)),
            "comments_processed": len(comments_data),
            "total_rows": len(comments_data),
            "message": "File uploaded and processed successfully",
            "model_source": "huggingface"
        }
        
        log_analysis_step("✅ UPLOAD COMPLETE", f"Videos: {result['videos_processed']}, Comments: {result['comments_processed']}")
        
        return result
        
    except Exception as e:
        log_analysis_step("❌ UPLOAD FAILED", f"Error: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.post("/api/analysis/start")
async def start_analysis(request: dict):
    """Start AI analysis of uploaded comments using Hugging Face models"""
    global current_analysis_id, analysis_results
    
    if not comments_data:
        log_analysis_step("❌ ANALYSIS START FAILED", "No comments to analyze. Please upload a file first.")
        raise HTTPException(status_code=400, detail="No comments to analyze. Please upload a file first.")
    
    # Check if there's an existing stopped analysis to resume
    resume_analysis_id = request.get("resume_analysis_id")
    if resume_analysis_id and resume_analysis_id in analysis_results:
        existing_analysis = analysis_results[resume_analysis_id]
        if existing_analysis["status"] == "stopped":
            log_analysis_step("🔄 RESUMING HF ANALYSIS", f"Resuming analysis ID: {resume_analysis_id}")
            # Resume the existing analysis
            analysis_results[resume_analysis_id]["status"] = "processing"
            current_analysis_id = resume_analysis_id
            
            # Start analysis from where it left off
            asyncio.create_task(run_hf_analysis(resume_analysis_id, resume=True))
            
            return {"analysis_id": resume_analysis_id, "status": "resumed", "model_source": "huggingface"}
    
    # Start new analysis
    analysis_id = str(uuid.uuid4())
    current_analysis_id = analysis_id
    
    log_analysis_step("🎯 HF ANALYSIS STARTED", f"Analysis ID: {analysis_id}, Total comments: {len(comments_data)}")
    
    analysis_results[analysis_id] = {
        "analysis_id": analysis_id,
        "status": "processing",
        "progress": 0,
        "total_comments": len(comments_data),
        "processed_comments": 0,
        "results": [],
        "model_source": "huggingface"
    }
    
    # Start analysis in background
    asyncio.create_task(run_hf_analysis(analysis_id))
    
    return {"analysis_id": analysis_id, "status": "started", "model_source": "huggingface"}

async def run_hf_analysis(analysis_id: str, resume: bool = False):
    """Run Hugging Face analysis on comments with detailed logging"""
    global analysis_results, comments_data, cancelled_analyses
    
    log_analysis_step("🔄 HF BACKGROUND ANALYSIS STARTED", f"Analysis ID: {analysis_id}, Resume: {resume}", analysis_id=analysis_id)
    
    try:
        # Get existing results if resuming
        if resume and analysis_id in analysis_results:
            results = analysis_results[analysis_id].get("results", [])
            start_index = len(results)
            log_analysis_step("🔄 RESUMING FROM", f"Starting from comment {start_index + 1}", analysis_id=analysis_id)
        else:
            results = []
            start_index = 0
        
        total = len(comments_data)
        start_time = time.time()
        
        log_analysis_step("⚙️ HF ANALYSIS PARAMETERS", f"Total comments: {total}, Start index: {start_index}, Mode: {current_analysis_mode}", analysis_id=analysis_id)
        
        # Process comments in optimized batches for maximum speed
        batch_size = 32  # Process 32 comments at a time
        current_comment_num = start_index
        
        for i in range(start_index, total, batch_size):
            # Check if analysis was cancelled
            if analysis_id in cancelled_analyses:
                log_analysis_step("🛑 HF ANALYSIS CANCELLED", f"Stopped at comment {current_comment_num+1}/{total}", analysis_id=analysis_id)
                analysis_results[analysis_id]["status"] = "stopped"
                cancelled_analyses.discard(analysis_id)  # Remove from cancelled set
                return
            
            batch_end = min(i + batch_size, total)
            batch_comments = comments_data[i:batch_end]
            
            # Log progress every batch
            if current_comment_num % 100 == 0 or current_comment_num in [1, 5, 25, 50, 100, 250, 500, 1000]:
                elapsed_time = time.time() - start_time
                comments_processed_in_session = current_comment_num - start_index
                comments_per_second = comments_processed_in_session / elapsed_time if elapsed_time > 0 else 0
                estimated_remaining = (total - current_comment_num) / comments_per_second if comments_per_second > 0 else 0
                
                log_analysis_step("📈 HF OPTIMIZED PROGRESS UPDATE", 
                    f"Comment {current_comment_num}/{total} ({((current_comment_num)/total*100):.1f}%) | "
                    f"Speed: {comments_per_second:.2f} comments/sec | "
                    f"ETA: {estimated_remaining/60:.1f} minutes", 
                    analysis_id=analysis_id)
            
            # Check cancellation again before processing batch
            if analysis_id in cancelled_analyses:
                log_analysis_step("🛑 HF ANALYSIS CANCELLED", f"Stopped at comment {current_comment_num+1}/{total}", analysis_id=analysis_id)
                analysis_results[analysis_id]["status"] = "stopped"
                cancelled_analyses.discard(analysis_id)  # Remove from cancelled set
                return
            
            # Prepare batch data for optimized processing
            batch_data = []
            for comment in batch_comments:
                if comment.get("text_original", "").strip():
                    batch_data.append((comment["text_original"], comment["comment_id"]))
            
            if batch_data:
                try:
                    # Analyze entire batch at once using optimized pipeline
                    batch_results = await analyze_batch_with_hf_optimized(batch_data)
                    
                    # Update comments with analysis results
                    for j, (comment_text, comment_id) in enumerate(batch_data):
                        if j < len(batch_results):
                            analysis_result = batch_results[j]
                            
                            # Find the corresponding comment in the original list
                            comment_index = i + j
                            if comment_index < len(comments_data):
                                comments_data[comment_index]["analysis"] = analysis_result
                                results.append(comments_data[comment_index])
                    
                    current_comment_num += len(batch_comments)
                    
                    # Check cancellation after batch processing
                    if analysis_id in cancelled_analyses:
                        log_analysis_step("🛑 HF ANALYSIS CANCELLED", f"Stopped at comment {current_comment_num+1}/{total}", analysis_id=analysis_id)
                        analysis_results[analysis_id]["status"] = "stopped"
                        cancelled_analyses.discard(analysis_id)  # Remove from cancelled set
                        return
                    
                except Exception as e:
                    log_analysis_step("❌ BATCH ANALYSIS ERROR", f"Error analyzing batch {i+1}-{batch_end}: {str(e)}", analysis_id=analysis_id)
                    # Fallback to individual processing for this batch
                    for comment in batch_comments:
                        # Check cancellation before each individual comment
                        if analysis_id in cancelled_analyses:
                            log_analysis_step("🛑 HF ANALYSIS CANCELLED", f"Stopped at comment {current_comment_num+1}/{total}", analysis_id=analysis_id)
                            analysis_results[analysis_id]["status"] = "stopped"
                            cancelled_analyses.discard(analysis_id)  # Remove from cancelled set
                            return
                            
                        try:
                            analysis = await analyze_comment_with_hf_optimized(
                                comment["text_original"], 
                                comment["comment_id"], 
                                analysis_id
                            )
                            comment["analysis"] = analysis
                            results.append(comment)
                            current_comment_num += 1
                        except Exception as individual_error:
                            log_analysis_step("❌ INDIVIDUAL COMMENT ERROR", f"Error analyzing comment {comment['comment_id']}: {str(individual_error)}", analysis_id=analysis_id)
                            current_comment_num += 1
            else:
                current_comment_num += len(batch_comments)
            
            # Update progress
            progress = int((current_comment_num) / total * 100)
            analysis_results[analysis_id].update({
                "progress": progress,
                "processed_comments": current_comment_num,
                "results": results
            })
            
            # Small delay between batches
            await asyncio.sleep(0.05)  # Reduced delay for optimized processing
        
        # Mark as completed only if not cancelled
        if analysis_id not in cancelled_analyses:
            total_time = time.time() - start_time
            avg_time_per_comment = total_time / total
            
            log_analysis_step("🎉 HF ANALYSIS COMPLETED", 
                f"Total time: {total_time/60:.2f} minutes | "
                f"Average: {avg_time_per_comment:.2f}s per comment | "
                f"Total comments analyzed: {total}", 
                analysis_id=analysis_id)
            
            analysis_results[analysis_id]["status"] = "completed"
        
    except Exception as e:
        log_analysis_step("💥 HF ANALYSIS FAILED", f"Error: {e}", analysis_id=analysis_id)
        analysis_results[analysis_id]["status"] = "failed"
        analysis_results[analysis_id]["error"] = str(e)

@app.get("/api/analysis/status/{analysis_id}")
async def get_analysis_status(analysis_id: str):
    """Get analysis status"""
    log_analysis_step("📊 HF STATUS REQUEST", f"Analysis ID: {analysis_id}")
    
    if analysis_id not in analysis_results:
        log_analysis_step("❌ HF STATUS NOT FOUND", f"Analysis ID: {analysis_id}")
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    status = analysis_results[analysis_id]
    log_analysis_step("✅ HF STATUS RETURNED", f"Status: {status['status']}, Progress: {status['progress']}%, Processed: {status['processed_comments']}/{status['total_comments']}")
    
    return status

@app.post("/api/analysis/stop/{analysis_id}")
async def stop_analysis(analysis_id: str):
    """Stop a running analysis"""
    global cancelled_analyses
    
    if analysis_id not in analysis_results:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    if analysis_results[analysis_id]["status"] != "processing":
        raise HTTPException(status_code=400, detail="Analysis is not currently running")
    
    # Mark analysis for cancellation and immediately update status
    cancelled_analyses.add(analysis_id)
    analysis_results[analysis_id]["status"] = "stopping"
    log_analysis_step("🛑 HF STOP REQUESTED", f"Analysis ID: {analysis_id}", analysis_id=analysis_id)
    
    return {"message": "Analysis stop requested", "analysis_id": analysis_id, "status": "stopping", "model_source": "huggingface"}

@app.get("/api/dashboard/stats")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    if not comments_data:
        return {
            "total_comments": 0,
            "total_videos": 0,
            "analyzed_comments": 0,
            "average_quality_score": 0,
            "positive_sentiment_ratio": 0,
            "negative_sentiment_ratio": 0,
            "neutral_sentiment_ratio": 0,
            "spam_ratio": 0,
            "top_categories": [],
            "comment_timeline": [],
            "quality_distribution": [],
            "model_source": "huggingface"
        }
    
    # Calculate statistics
    analyzed_comments = [c for c in comments_data if c.get("analysis")]
    total_comments = len(comments_data)
    total_videos = len(set(c["video_id"] for c in comments_data))
    
    if analyzed_comments:
        # Sentiment ratios
        sentiments = [c["analysis"]["sentiment"] for c in analyzed_comments]
        positive_ratio = sentiments.count("positive") / len(sentiments)
        negative_ratio = sentiments.count("negative") / len(sentiments)
        neutral_ratio = sentiments.count("neutral") / len(sentiments)
        
        # Quality score
        quality_scores = [c["analysis"]["quality_score"] for c in analyzed_comments]
        avg_quality = sum(quality_scores) / len(quality_scores)
        
        # Spam ratio
        spam_count = sum(1 for c in analyzed_comments if c["analysis"]["is_spam"])
        spam_ratio = spam_count / len(analyzed_comments)
        
        # Categories
        categories = [c["analysis"]["category"] for c in analyzed_comments]
        category_counts = {}
        for cat in categories:
            category_counts[cat] = category_counts.get(cat, 0) + 1
        top_categories = [{"category": k, "count": v} for k, v in sorted(category_counts.items(), key=lambda x: x[1], reverse=True)]
        
        # Quality distribution
        quality_ranges = {"0-0.2": 0, "0.2-0.4": 0, "0.4-0.6": 0, "0.6-0.8": 0, "0.8-1.0": 0}
        for score in quality_scores:
            if score < 0.2:
                quality_ranges["0-0.2"] += 1
            elif score < 0.4:
                quality_ranges["0.2-0.4"] += 1
            elif score < 0.6:
                quality_ranges["0.4-0.6"] += 1
            elif score < 0.8:
                quality_ranges["0.6-0.8"] += 1
            else:
                quality_ranges["0.8-1.0"] += 1
        
        quality_distribution = [{"range": k, "count": v} for k, v in quality_ranges.items()]
        
        # Timeline (simplified)
        comment_timeline = [{"date": "2024-01-15", "count": total_comments, "quality_avg": avg_quality}]
        
    else:
        positive_ratio = negative_ratio = neutral_ratio = avg_quality = spam_ratio = 0
        top_categories = []
        quality_distribution = []
        comment_timeline = []
    
    return {
        "total_comments": total_comments,
        "total_videos": total_videos,
        "analyzed_comments": len(analyzed_comments),
        "average_quality_score": avg_quality,
        "positive_sentiment_ratio": positive_ratio,
        "negative_sentiment_ratio": negative_ratio,
        "neutral_sentiment_ratio": neutral_ratio,
        "spam_ratio": spam_ratio,
        "top_categories": top_categories,
        "comment_timeline": comment_timeline,
        "quality_distribution": quality_distribution,
        "model_source": "huggingface"
    }

@app.post("/api/comments/search")
async def search_comments(request: dict):
    """Search comments with filters"""
    try:
        query = request.get("query", "")
        filters = request.get("filters", {})
        skip = request.get("skip", 0)
        limit = request.get("limit", 10)
        
        print(f"Search request: query='{query}', filters={filters}, skip={skip}, limit={limit}")
        print(f"Total comments available: {len(comments_data)}")
        
        # Apply filters to comments
        filtered_comments = []
        
        for comment in comments_data:
            try:
                # Text search filter
                if query and query.lower() not in comment.get("text_original", "").lower():
                    continue
                    
                # Sentiment filter - only apply if analysis exists
                if filters.get("sentiment") and comment.get("analysis") and comment.get("analysis", {}).get("sentiment") != filters["sentiment"]:
                    continue
                    
                # Category filter - only apply if analysis exists
                if filters.get("category") and comment.get("analysis") and comment.get("analysis", {}).get("category") != filters["category"]:
                    continue
                    
                # Spam filter - only apply if analysis exists
                if filters.get("is_spam") != "" and comment.get("analysis"):
                    is_spam = comment.get("analysis", {}).get("is_spam", False)
                    filter_spam = filters["is_spam"] == "true"
                    if is_spam != filter_spam:
                        continue
                
                filtered_comments.append(comment)
            except Exception as e:
                print(f"Error processing comment: {e}")
                continue
        
        # Apply pagination
        total_filtered = len(filtered_comments)
        paginated_comments = filtered_comments[skip:skip + limit]
        
        print(f"Filtered results: {total_filtered} total, returning {len(paginated_comments)} comments")
        
        return {
            "comments": paginated_comments,
            "total_count": total_filtered,
            "page": (skip // limit) + 1,
            "page_size": limit,
            "total_pages": (total_filtered + limit - 1) // limit,
            "model_source": "huggingface"
        }
    except Exception as e:
        print(f"Error in search_comments: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Hugging Face backend on port 8001...")
    print("🤖 Using ONLY Hugging Face models - no OpenAI API calls")
    print("📊 Enhanced logging enabled - you'll see detailed analysis steps in the terminal")
    uvicorn.run(app, host="0.0.0.0", port=8001)
