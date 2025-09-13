# L'Oréal AI Comment Analysis System

A comprehensive web application for analyzing YouTube beauty comments using AI-powered features including sentiment analysis, quality scoring, categorization, and spam detection. This system is designed for L'Oréal's hackathon to provide real-time insights into customer feedback and engagement.

## System Overview

This system provides a complete solution for analyzing beauty-related comments from YouTube videos, offering:

- **Real-time AI Analysis**: Powered by OpenAI GPT-4o-mini for accurate sentiment and content analysis
- **Interactive Dashboard**: Real-time visualizations and analytics with live progress tracking
- **Advanced Filtering**: Search and filter comments by sentiment, category, quality, and spam status
- **Scalable Architecture**: FastAPI backend with React frontend, designed for high-volume comment processing
- **Graceful Control**: Start, stop, and monitor analysis processes with real-time status updates

## AI/ML Theory & Implementation

### Core AI Analysis Pipeline

The system uses a sophisticated AI analysis pipeline that processes each comment through multiple dimensions:

#### 1. **Sentiment Analysis**
- **Model**: OpenAI GPT-4o-mini with beauty-specific prompts
- **Approach**: Context-aware analysis using domain-specific prompts
- **Output**: Positive, Negative, or Neutral classification
- **Confidence**: 0.85 average confidence score with fallback parsing

#### 2. **Content Categorization**
- **Categories**: Skincare, Makeup, Fragrance, Haircare, General
- **Method**: Keyword-based and semantic analysis
- **AI Enhancement**: GPT-4o-mini understanding of beauty industry terminology
- **Fallback**: Rule-based classification for edge cases

#### 3. **Quality Scoring**
- **Range**: 0.0 to 1.0 scale
- **Factors**: Relevance, detail level, helpfulness, engagement
- **AI Assessment**: Contextual understanding of comment value
- **Business Value**: Identifies high-quality customer feedback

#### 4. **Spam Detection**
- **Approach**: AI-powered detection of promotional content
- **Criteria**: Repetitive text, promotional language, low-quality content
- **Accuracy**: High precision with false positive protection
- **Business Impact**: Filters noise to focus on genuine customer feedback

### Technical Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   AI Service    │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (OpenAI)      │
│                 │    │                 │    │                 │
│ • Dashboard     │    │ • REST API      │    │ • GPT-4o-mini   │
│ • Comments      │    │ • File Upload   │    │ • Analysis      │
│ • Analysis      │    │ • Real-time     │    │ • Categorization│
│ • Upload        │    │ • Status        │    │ • Quality Score │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Features

### Core Functionality
- **Real-time Dashboard**: Live statistics, progress tracking, and analytics
- **Comment Management**: Upload, search, filter, and analyze comments
- **AI Analysis**: Automated sentiment, category, quality, and spam analysis
- **⏸Process Control**: Start, stop, and monitor analysis with real-time updates
- **Advanced Search**: Multi-criteria filtering and text search
- **Analytics**: Quality trends, sentiment distribution, category insights

### AI-Powered Analysis
- **Sentiment Classification**: Positive/Negative/Neutral with confidence scores
- **Beauty Categorization**: Automatic tagging into beauty product categories
- **Quality Assessment**: AI-powered quality scoring (0.0-1.0)
- **Spam Detection**: Intelligent filtering of promotional content
- **Real-time Processing**: Live analysis with progress tracking

### User Experience
- **Responsive Design**: Material-UI components for modern interface
- **Real-time Updates**: Live progress tracking during analysis
- **Error Handling**: Graceful error management and user feedback
- **State Persistence**: Analysis state recovery across sessions

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Material-UI (MUI)** for modern, responsive components
- **Recharts** for data visualization
- **Axios** for API communication
- **React Router** for navigation

### Backend
- **FastAPI** for high-performance API
- **Python 3.12** with async/await support
- **OpenAI API** for AI analysis
- **Pandas** for data processing
- **Uvicorn** ASGI server

### AI/ML
- **OpenAI GPT-4o-mini** for natural language processing
- **Custom prompts** optimized for beauty industry
- **Fallback parsing** for robust error handling
- **Confidence scoring** for analysis reliability

## 📁 Project Structure

```
loreal-hackathon-codes/
├── frontend/                    # React TypeScript frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── Navbar.tsx
│   │   ├── contexts/           # React context providers
│   │   │   └── AnalysisContext.tsx
│   │   ├── pages/              # Main application pages
│   │   │   ├── Analysis.tsx    # Analysis control and monitoring
│   │   │   ├── Comments.tsx    # Comment browsing and filtering
│   │   │   ├── Configuration.tsx
│   │   │   ├── Dashboard.tsx   # Analytics dashboard
│   │   │   └── Upload.tsx      # File upload interface
│   │   ├── services/           # API communication
│   │   │   └── api.ts
│   │   ├── types/              # TypeScript type definitions
│   │   │   └── index.ts
│   │   └── utils/              # Utility functions
│   ├── package.json
│   └── tsconfig.json
├── backend/                     # FastAPI Python backend
│   ├── main.py                 # Main FastAPI application
│   ├── config.env              # Environment configuration
│   └── uploads/                # Uploaded CSV files
├── script/                      # Sample data files
│   ├── comments1.csv
│   ├── comments2.csv
│   ├── comments3.csv
│   ├── comments4.csv
│   ├── comments5.csv
│   ├── videos.csv
│   └── dataset_description.xlsx
├── venv/                        # Python virtual environment
└── README.md
```

## Quick Start

### Prerequisites

- **Python 3.12+** with pip
- **Node.js 16+** with npm
- **OpenAI API Key** (get from [OpenAI Platform](https://platform.openai.com))
- **Git** for version control

### 1. Clone the Repository

```bash
git clone <repository-url>
cd loreal-hackathon-codes
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv ../venv
# On Windows:
..\venv\Scripts\activate
# On macOS/Linux:
source ../venv/bin/activate

# Install dependencies
pip install fastapi uvicorn pandas openai python-dotenv

# Configure environment variables
# Edit config.env with your OpenAI API key
# OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# The frontend will connect to backend on localhost:8000
```

### 4. Start the Application

#### Terminal 1 - Backend Server
```bash
cd backend
python main.py
```
Backend will start on: http://localhost:8000

#### Terminal 2 - Frontend Development Server
```bash
cd frontend
npm start
```
Frontend will start on: http://localhost:3000

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Usage Guide

### 1. Upload Data
1. Navigate to the **Upload** page
2. Select a CSV file with comment data
3. Click **"Upload File"** to process the data
4. Wait for upload confirmation

### 2. Run Analysis
1. Go to the **Analysis** page
2. Click **"Start Analysis"** to begin AI processing
3. Monitor real-time progress in the dashboard
4. Use **"Stop Analysis"** to cancel if needed

### 3. View Results
1. Check the **Dashboard** for overview statistics
2. Use the **Comments** page to browse analyzed comments
3. Apply filters by sentiment, category, quality score, etc.
4. Search for specific terms or phrases

### 4. Monitor Progress
- Real-time progress updates during analysis
- Live statistics and metrics
- Error handling and status reporting
- Graceful stop/start functionality

## API Endpoints

### Core Endpoints

#### Comments
- `POST /api/comments/upload` - Upload CSV file with comments
- `POST /api/comments/search` - Search comments with filters
- `GET /api/comments` - List all comments (if implemented)

#### Analysis
- `POST /api/analysis/start` - Start AI analysis process
- `GET /api/analysis/status/{analysis_id}` - Get analysis status
- `POST /api/analysis/stop/{analysis_id}` - Stop running analysis

#### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /health` - Health check endpoint

### Request/Response Examples

#### Start Analysis
```bash
POST /api/analysis/start
{
  "analysis_types": ["quality", "sentiment", "categorization", "spam"]
}

Response:
{
  "analysis_id": "uuid-string",
  "status": "started"
}
```

#### Search Comments
```bash
POST /api/comments/search
{
  "query": "skincare",
  "filters": {
    "sentiment": "positive",
    "category": "skincare",
    "is_spam": "false"
  },
  "skip": 0,
  "limit": 10
}
```

## AI Analysis Details

### Analysis Process

1. **File Upload**: CSV files are processed and comments are extracted
2. **AI Processing**: Each comment is analyzed using OpenAI GPT-4o-mini
3. **Real-time Updates**: Progress is tracked and updated in real-time
4. **Result Storage**: Analysis results are stored in memory for immediate access
5. **Dashboard Updates**: Statistics are calculated and displayed live

### AI Model Configuration

```python
# OpenAI Configuration
model = "gpt-4o-mini"
max_tokens = 150
temperature = 0.1  # Low temperature for consistent results

# Analysis Prompt
prompt = """
Analyze this beauty comment: "{comment_text}"

Return a JSON object with:
{
    "sentiment": "positive", "negative", or "neutral",
    "category": "skincare", "makeup", "fragrance", "haircare", or "general",
    "quality_score": 0.0 to 1.0 (based on relevance, detail, helpfulness),
    "is_spam": true or false
}
"""
```

### Quality Scoring Algorithm

The quality score (0.0-1.0) is determined by:
- **Relevance**: How relevant the comment is to beauty products
- **Detail**: Level of detail and specificity
- **Helpfulness**: Value to other customers
- **Engagement**: Like count and interaction indicators
- **Language Quality**: Grammar, spelling, and clarity

## 🚀 Performance & Scalability

### Current Capabilities
- **Processing Speed**: ~5 comments per second (with rate limiting)
- **Memory Usage**: In-memory storage for demo purposes
- **Concurrent Users**: Single-user focused design
- **File Size**: Handles CSV files with thousands of comments

### Optimization Features
- **Rate Limiting**: 0.2s delay between API calls to prevent rate limiting
- **Async Processing**: Non-blocking analysis with real-time updates
- **Error Handling**: Graceful fallbacks for API failures
- **Progress Tracking**: Real-time progress updates for user feedback

## 🛡 Security & Configuration

### Environment Variables

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# CORS Settings
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# App Settings
SECRET_KEY=your_secret_key_here
```

### Security Features
- **CORS Protection**: Configured for specific origins
- **Input Validation**: FastAPI automatic validation
- **Error Handling**: Secure error messages without sensitive data
- **Rate Limiting**: Built-in delays to prevent API abuse

## Development & Deployment

### Development Mode

```bash
# Backend (with auto-reload)
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Frontend (with hot-reload)
cd frontend
npm start
```

### Production Deployment

#### Backend
```bash
# Install production dependencies
pip install fastapi uvicorn[standard] gunicorn

# Run with Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

#### Frontend
```bash
# Build for production
npm run build

# Serve static files
npx serve -s build -l 3000
```

## Troubleshooting

### Common Issues

#### Backend Issues
1. **OpenAI API Key Error**
   - Verify API key in `config.env`
   - Check OpenAI account billing status

2. **Port Already in Use**
   - Change port in `main.py` or kill existing process
   - Use `netstat -ano | findstr :8000` (Windows) to find process

3. **Import Errors**
   - Ensure virtual environment is activated
   - Install missing dependencies with `pip install`

#### Frontend Issues
1. **API Connection Failed**
   - Verify backend is running on port 8000
   - Check CORS configuration

2. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check TypeScript errors in console

### Debug Mode

```bash
# Backend with debug logging
cd backend
python -c "import logging; logging.basicConfig(level=logging.DEBUG)"
python main.py

# Frontend with verbose logging
cd frontend
REACT_APP_DEBUG=true npm start
```

## Future Enhancements

### Planned Features
- **Database Integration**: Persistent storage with PostgreSQL
- **User Authentication**: Multi-user support with JWT
- **Batch Processing**: Celery for background task processing
- **Advanced Analytics**: Machine learning insights and trends
- **Export Functionality**: CSV/Excel export of analysis results
- **Real-time Collaboration**: Multiple users monitoring analysis

### Scalability Improvements
- **Redis Caching**: Improved performance for large datasets
- **Microservices**: Separate analysis service for better scaling
- **Load Balancing**: Multiple backend instances
- **Database Optimization**: Indexed queries and connection pooling

## Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and test thoroughly
4. Commit with descriptive messages
5. Push and create a pull request

### Code Standards
- **Python**: Follow PEP 8 style guide
- **TypeScript**: Use strict type checking
- **React**: Functional components with hooks
- **API**: RESTful design principles

## License

This project is developed for L'Oréal's hackathon and is proprietary software.

## Support

For technical support or questions:

1. **Check the API documentation**: http://localhost:8000/docs
2. **Review console logs**: Browser console for frontend, terminal for backend
3. **Verify environment setup**: Ensure all dependencies are installed
4. **Check OpenAI API status**: Verify API key and billing status
