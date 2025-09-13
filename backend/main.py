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

def analyze_comment_with_ai(comment_text: str) -> Dict[str, Any]:
    """Analyze a single comment using OpenAI"""
    try:
        # Combined prompt for efficiency
        combined_prompt = f"""
        Analyze this beauty comment: "{comment_text}"
        
        Return a JSON object with:
        {{
            "sentiment": "positive", "negative", or "neutral",
            "category": "skincare", "makeup", "fragrance", "haircare", or "general",
            "quality_score": 0.0 to 1.0 (based on relevance, detail, helpfulness),
            "is_spam": true or false
        }}
        """
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": combined_prompt}],
            max_tokens=150,
            temperature=0.1
        )
        
        result_text = response.choices[0].message.content.strip()
        
        # Try to parse JSON response
        try:
            result = json.loads(result_text)
            return {
                "sentiment": result.get("sentiment", "neutral"),
                "category": result.get("category", "general"),
                "quality_score": float(result.get("quality_score", 0.5)),
                "is_spam": bool(result.get("is_spam", False)),
                "confidence": 0.85
            }
        except json.JSONDecodeError:
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
                
            return {
                "sentiment": sentiment,
                "category": category,
                "quality_score": quality_score,
                "is_spam": is_spam,
                "confidence": 0.7
            }
        
    except Exception as e:
        print(f"Error analyzing comment: {e}")
        # Fallback to simple analysis
        return {
            "sentiment": "neutral",
            "category": "general", 
            "quality_score": 0.5,
            "is_spam": False,
            "confidence": 0.3
        }

def process_csv_file(file_path: str) -> List[Dict[str, Any]]:
    """Process CSV file and return structured data"""
    try:
        df = pd.read_csv(file_path)
        processed_comments = []
        
        for _, row in df.iterrows():
            comment = {
                "comment_id": str(row.get('commentId', '')),
                "text_original": str(row.get('textOriginal', '')),
                "video_id": str(row.get('videoId', '')),
                "author_id": str(row.get('authorId', '')),
                "like_count": int(row.get('likeCount', 0)) if pd.notna(row.get('likeCount')) else 0,
                "published_at": str(row.get('publishedAt', '')),
                "analysis": None  # Will be filled during analysis
            }
            processed_comments.append(comment)
        
        return processed_comments
        
    except Exception as e:
        print(f"Error processing CSV: {e}")
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
    
    try:
        # Save uploaded file
        file_path = f"uploads/{file.filename}"
        os.makedirs("uploads", exist_ok=True)
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Process CSV
        comments_data = process_csv_file(file_path)
        
        return {
            "videos_processed": len(set(c["video_id"] for c in comments_data)),
            "comments_processed": len(comments_data),
            "total_rows": len(comments_data),
            "message": "File uploaded and processed successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.post("/api/analysis/start")
async def start_analysis(request: dict):
    """Start AI analysis of uploaded comments"""
    global current_analysis_id, analysis_results
    
    if not comments_data:
        raise HTTPException(status_code=400, detail="No comments to analyze. Please upload a file first.")
    
    analysis_id = str(uuid.uuid4())
    current_analysis_id = analysis_id
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
    """Run AI analysis on comments"""
    global analysis_results, comments_data, cancelled_analyses
    
    try:
        results = []
        total = len(comments_data)
        
        for i, comment in enumerate(comments_data):
            # Check if analysis was cancelled
            if analysis_id in cancelled_analyses:
                analysis_results[analysis_id]["status"] = "stopped"
                cancelled_analyses.discard(analysis_id)  # Remove from cancelled set
                return
            
            # Analyze comment with AI
            analysis = analyze_comment_with_ai(comment["text_original"])
            
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
            analysis_results[analysis_id]["status"] = "completed"
        
    except Exception as e:
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
    query = request.get("query", "")
    filters = request.get("filters", {})
    skip = request.get("skip", 0)
    limit = request.get("limit", 10)
    
    print(f"Search request: query='{query}', filters={filters}, skip={skip}, limit={limit}")
    print(f"Total comments available: {len(comments_data)}")
    
    # Apply filters to comments
    filtered_comments = []
    
    for comment in comments_data:
        # Text search filter
        if query and query.lower() not in comment.get("text_original", "").lower():
            continue
            
        # Sentiment filter
        if filters.get("sentiment") and comment.get("analysis", {}).get("sentiment") != filters["sentiment"]:
            continue
            
        # Category filter
        if filters.get("category") and comment.get("analysis", {}).get("category") != filters["category"]:
            continue
            
        # Spam filter
        if filters.get("is_spam") != "":
            is_spam = comment.get("analysis", {}).get("is_spam", False)
            filter_spam = filters["is_spam"] == "true"
            if is_spam != filter_spam:
                continue
        
        filtered_comments.append(comment)
    
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

if __name__ == "__main__":
    import uvicorn
    print("Starting AI backend on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
