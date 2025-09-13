from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
import json
import asyncio
from datetime import datetime
from typing import List, Dict, Any
import openai
from dotenv import load_dotenv
import uuid
import re
import time

# Load environment variables
load_dotenv("config.env")

# Initialize OpenAI client
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize FastAPI app
app = FastAPI(
    title="L'Oréal Comment Analysis API",
    description="Real AI-powered analysis of beauty comments",
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

def analyze_comment_with_ai(comment_text: str, comment_id: str = "", analysis_id: str = "") -> Dict[str, Any]:
    """Analyze a single comment using OpenAI with detailed logging"""
    log_analysis_step("🔍 STARTING COMMENT ANALYSIS", f"Text: '{comment_text[:50]}{'...' if len(comment_text) > 50 else ''}'", comment_id, analysis_id)
    
    try:
        # Combined prompt for efficiency
        combined_prompt = f"""
        Analyze this beauty comment: "{comment_text}"
        
        Return ONLY a valid JSON object (no markdown, no code blocks) with:
        {{
            "sentiment": "positive", "negative", or "neutral",
            "category": "skincare", "makeup", "fragrance", "haircare", or "general",
            "quality_score": 0.0 to 1.0 (based on relevance, detail, helpfulness),
            "is_spam": true or false
        }}
        """
        
        log_analysis_step("📤 SENDING TO OPENAI", f"Model: gpt-4o-mini, Max tokens: 150, Temperature: 0.1", comment_id, analysis_id)
        
        start_time = time.time()
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": combined_prompt}],
            max_tokens=150,
            temperature=0.1
        )
        api_time = time.time() - start_time
        
        result_text = response.choices[0].message.content.strip()
        log_analysis_step("📥 RECEIVED OPENAI RESPONSE", f"Response time: {api_time:.2f}s, Response: '{result_text[:100]}{'...' if len(result_text) > 100 else ''}'", comment_id, analysis_id)
        
        # Clean the response text (remove markdown code blocks if present)
        cleaned_text = result_text
        if cleaned_text.startswith('```json') or cleaned_text.startswith('```'):
            log_analysis_step("🧹 CLEANING RESPONSE", "Removing markdown code blocks", comment_id, analysis_id)
            if cleaned_text.startswith('```json'):
                cleaned_text = cleaned_text[7:]  # Remove ```json
            if cleaned_text.startswith('```'):
                cleaned_text = cleaned_text[3:]   # Remove ```
            if cleaned_text.endswith('```'):
                cleaned_text = cleaned_text[:-3]  # Remove trailing ```
            cleaned_text = cleaned_text.strip()
        
        # Try to parse JSON response
        try:
            result = json.loads(cleaned_text)
            log_analysis_step("✅ JSON PARSING SUCCESS", f"Parsed: {result}", comment_id, analysis_id)
            
            analysis_result = {
                "sentiment": result.get("sentiment", "neutral"),
                "category": result.get("category", "general"),
                "quality_score": float(result.get("quality_score", 0.5)),
                "is_spam": bool(result.get("is_spam", False)),
                "confidence": 0.85
            }
            
            log_analysis_step("🎯 ANALYSIS COMPLETE", f"Sentiment: {analysis_result['sentiment']}, Category: {analysis_result['category']}, Quality: {analysis_result['quality_score']:.2f}, Spam: {analysis_result['is_spam']}", comment_id, analysis_id)
            
            return analysis_result
            
        except json.JSONDecodeError as e:
            log_analysis_step("⚠️ JSON PARSING FAILED", f"Error: {e}, Using fallback parsing", comment_id, analysis_id)
            
            # Fallback parsing if JSON fails
            sentiment = "neutral"
            category = "general"
            quality_score = 0.5
            is_spam = False
            
            if "positive" in result_text.lower():
                sentiment = "positive"
            elif "negative" in result_text.lower():
                sentiment = "negative"
                
            if "skincare" in result_text.lower():
                category = "skincare"
            elif "makeup" in result_text.lower():
                category = "makeup"
            elif "fragrance" in result_text.lower():
                category = "fragrance"
            elif "haircare" in result_text.lower():
                category = "haircare"
                
            if "true" in result_text.lower() and "spam" in result_text.lower():
                is_spam = True
            
            fallback_result = {
                "sentiment": sentiment,
                "category": category,
                "quality_score": quality_score,
                "is_spam": is_spam,
                "confidence": 0.7
            }
            
            log_analysis_step("🔄 FALLBACK PARSING COMPLETE", f"Sentiment: {sentiment}, Category: {category}, Quality: {quality_score:.2f}, Spam: {is_spam}", comment_id, analysis_id)
            
            return fallback_result
        
    except Exception as e:
        log_analysis_step("❌ ANALYSIS ERROR", f"Error: {e}", comment_id, analysis_id)
        
        # Fallback to simple analysis
        fallback_result = {
            "sentiment": "neutral",
            "category": "general", 
            "quality_score": 0.5,
            "is_spam": False,
            "confidence": 0.3
        }
        
        log_analysis_step("🆘 EMERGENCY FALLBACK", f"Using default values: {fallback_result}", comment_id, analysis_id)
        
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
    return {"message": "L'Oréal AI Comment Analysis API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "ai_enabled": True}

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
            "message": "File uploaded and processed successfully"
        }
        
        log_analysis_step("✅ UPLOAD COMPLETE", f"Videos: {result['videos_processed']}, Comments: {result['comments_processed']}")
        
        return result
        
    except Exception as e:
        log_analysis_step("❌ UPLOAD FAILED", f"Error: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.post("/api/analysis/start")
async def start_analysis(request: dict):
    """Start AI analysis of uploaded comments"""
    global current_analysis_id, analysis_results
    
    if not comments_data:
        log_analysis_step("❌ ANALYSIS START FAILED", "No comments to analyze. Please upload a file first.")
        raise HTTPException(status_code=400, detail="No comments to analyze. Please upload a file first.")
    
    analysis_id = str(uuid.uuid4())
    current_analysis_id = analysis_id
    
    log_analysis_step("🎯 ANALYSIS STARTED", f"Analysis ID: {analysis_id}, Total comments: {len(comments_data)}")
    
    analysis_results[analysis_id] = {
        "status": "processing",
        "progress": 0,
        "total_comments": len(comments_data),
        "processed_comments": 0,
        "results": []
    }
    
    # Start analysis in background
    asyncio.create_task(run_ai_analysis(analysis_id))
    
    return {"analysis_id": analysis_id, "status": "started"}

async def run_ai_analysis(analysis_id: str):
    """Run AI analysis on comments with detailed logging"""
    global analysis_results, comments_data, cancelled_analyses
    
    log_analysis_step("🔄 BACKGROUND ANALYSIS STARTED", f"Analysis ID: {analysis_id}", analysis_id=analysis_id)
    
    try:
        results = []
        total = len(comments_data)
        start_time = time.time()
        
        log_analysis_step("⚙️ ANALYSIS PARAMETERS", f"Total comments: {total}, Model: gpt-4o-mini, Delay: 0.2s", analysis_id=analysis_id)
        
        for i, comment in enumerate(comments_data):
            # Check if analysis was cancelled
            if analysis_id in cancelled_analyses:
                log_analysis_step("🛑 ANALYSIS CANCELLED", f"Stopped at comment {i+1}/{total}", analysis_id=analysis_id)
                analysis_results[analysis_id]["status"] = "stopped"
                cancelled_analyses.discard(analysis_id)  # Remove from cancelled set
                return
            
            # Log progress every 10 comments or at milestones
            if (i + 1) % 10 == 0 or i + 1 in [1, 5, 25, 50, 100, 250, 500, 1000]:
                elapsed_time = time.time() - start_time
                comments_per_second = (i + 1) / elapsed_time if elapsed_time > 0 else 0
                estimated_remaining = (total - i - 1) / comments_per_second if comments_per_second > 0 else 0
                
                log_analysis_step("📈 PROGRESS UPDATE", 
                    f"Comment {i+1}/{total} ({((i+1)/total*100):.1f}%) | "
                    f"Speed: {comments_per_second:.2f} comments/sec | "
                    f"ETA: {estimated_remaining/60:.1f} minutes", 
                    analysis_id=analysis_id)
            
            # Analyze comment with AI
            analysis = analyze_comment_with_ai(
                comment["text_original"], 
                comment["comment_id"], 
                analysis_id
            )
            
            # Add analysis to comment
            comment["analysis"] = analysis
            results.append(comment)
            
            # Update progress
            progress = int((i + 1) / total * 100)
            analysis_results[analysis_id].update({
                "progress": progress,
                "processed_comments": i + 1,
                "results": results
            })
            
            # Small delay to prevent rate limiting
            await asyncio.sleep(0.2)
        
        # Mark as completed only if not cancelled
        if analysis_id not in cancelled_analyses:
            total_time = time.time() - start_time
            avg_time_per_comment = total_time / total
            
            log_analysis_step("🎉 ANALYSIS COMPLETED", 
                f"Total time: {total_time/60:.2f} minutes | "
                f"Average: {avg_time_per_comment:.2f}s per comment | "
                f"Total comments analyzed: {total}", 
                analysis_id=analysis_id)
            
            analysis_results[analysis_id]["status"] = "completed"
        
    except Exception as e:
        log_analysis_step("💥 ANALYSIS FAILED", f"Error: {e}", analysis_id=analysis_id)
        analysis_results[analysis_id]["status"] = "failed"
        analysis_results[analysis_id]["error"] = str(e)

@app.get("/api/analysis/status/{analysis_id}")
async def get_analysis_status(analysis_id: str):
    """Get analysis status"""
    if analysis_id not in analysis_results:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return analysis_results[analysis_id]

@app.post("/api/analysis/stop/{analysis_id}")
async def stop_analysis(analysis_id: str):
    """Stop a running analysis"""
    global cancelled_analyses
    
    if analysis_id not in analysis_results:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    if analysis_results[analysis_id]["status"] != "processing":
        raise HTTPException(status_code=400, detail="Analysis is not currently running")
    
    # Mark analysis for cancellation
    cancelled_analyses.add(analysis_id)
    log_analysis_step("🛑 STOP REQUESTED", f"Analysis ID: {analysis_id}", analysis_id=analysis_id)
    
    return {"message": "Analysis stop requested", "analysis_id": analysis_id}

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
            "quality_distribution": []
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
        "quality_distribution": quality_distribution
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
            "total_pages": (total_filtered + limit - 1) // limit
        }
    except Exception as e:
        print(f"Error in search_comments: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting AI backend on port 8000...")
    print("📊 Enhanced logging enabled - you'll see detailed analysis steps in the terminal")
    uvicorn.run(app, host="0.0.0.0", port=8000)
