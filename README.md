# L'Oréal AI Comment Analysis System

A comprehensive web application for analyzing YouTube beauty comments using AI-powered features including sentiment analysis, quality scoring, categorization, and spam detection. This system supports both OpenAI and Hugging Face models for flexible, cost-effective analysis.

## 🚀 System Overview

This system provides a complete solution for analyzing beauty-related comments from YouTube videos, offering:

- **Dual AI Backends**: Choose between OpenAI GPT-4o-mini or Hugging Face models
- **Real-time Analysis**: Live progress tracking with start/stop/resume functionality
- **Interactive Dashboard**: Real-time visualizations and analytics
- **Advanced Filtering**: Search and filter comments by sentiment, category, quality, and spam status
- **Scalable Architecture**: FastAPI backend with React frontend, optimized for high-volume processing

## 🤖 AI/ML Capabilities

### Dual Model Support

#### **OpenAI Backend (Port 8000)**
- **Model**: GPT-4o-mini for all analysis tasks
- **Features**: Sentiment, Spam Detection, Category, Quality Scoring
- **Accuracy**: Highest (GPT-4o-mini)
- **Cost**: Higher (API calls)
- **Speed**: Medium

#### **Hugging Face Backend (Port 8001)**
- **Models**: Specialized HF models for each task
  - **Sentiment**: `distilbert-base-uncased-finetuned-sst-2-english`
  - **Spam**: `distilbert-base-uncased`
  - **Category**: `facebook/bart-large-mnli`
  - **Quality**: `distilbert-base-uncased`
- **Features**: All 4 models working together in parallel
- **Accuracy**: High
- **Cost**: Free (local models)
- **Speed**: Fast (optimized batch processing)

### Analysis Pipeline

#### 1. **Sentiment Analysis**
- **OpenAI**: GPT-4o-mini with beauty-specific prompts
- **Hugging Face**: DistilBERT fine-tuned for sentiment
- **Output**: Positive, Negative, or Neutral classification
- **Confidence**: High accuracy with confidence scores

#### 2. **Spam Detection**
- **OpenAI**: AI-powered detection of promotional content
- **Hugging Face**: DistilBERT trained for spam classification
- **Criteria**: Repetitive text, promotional language, low-quality content
- **Accuracy**: High precision with false positive protection

#### 3. **Content Categorization**
- **OpenAI**: GPT-4o-mini understanding of beauty terminology
- **Hugging Face**: BART zero-shot classification
- **Categories**: Skincare, Makeup, Fragrance, Haircare, General
- **Method**: Semantic analysis with keyword fallbacks

#### 4. **Quality Scoring**
- **Range**: 0.0 to 1.0 scale
- **Factors**: Relevance, detail level, helpfulness, engagement
- **AI Assessment**: Contextual understanding of comment value
- **Business Value**: Identifies high-quality customer feedback

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for modern components
- **Recharts** for data visualization
- **Axios** for API communication
- **React Router** for navigation

### Backend
- **FastAPI** for high-performance API
- **Python 3.12** with async/await support
- **OpenAI API** for AI analysis (OpenAI backend)
- **Hugging Face Transformers** for local models (HF backend)
- **Pandas** for data processing
- **Uvicorn** ASGI server

### AI/ML
- **OpenAI GPT-4o-mini** (OpenAI backend)
- **Hugging Face Models** (HF backend)
- **Custom prompts** optimized for beauty industry
- **Batch processing** for performance optimization
- **Text caching** for repeated patterns

## 📁 Project Structure

```
loreal-hackathon-codes/
├── frontend/                    # React TypeScript frontend
│   ├── src/
│   │   ├── components/         # UI components
│   │   │   ├── ModelSwitcher.tsx      # AI/HF model switcher
│   │   │   ├── ModelSpecificOptions.tsx # Model-specific settings
│   │   │   ├── BackendInstructions.tsx # Backend setup help
│   │   │   └── ...
│   │   ├── contexts/           # React context providers
│   │   │   └── AnalysisContext.tsx
│   │   ├── pages/              # Main application pages
│   │   │   ├── Analysis.tsx    # Analysis control and monitoring
│   │   │   ├── Comments.tsx    # Comment browsing and filtering
│   │   │   ├── Dashboard.tsx   # Analytics dashboard
│   │   │   └── Upload.tsx      # File upload interface
│   │   ├── services/           # API communication
│   │   │   ├── api.ts
│   │   │   └── backendSwitcher.ts
│   │   └── types/              # TypeScript definitions
│   └── package.json
├── backend/                     # FastAPI Python backend
│   ├── main.py                 # OpenAI backend (port 8000)
│   ├── main_hf.py             # Hugging Face backend (port 8001)
│   ├── analysis_pipeline_optimized.py # HF model pipeline
│   ├── model_config.py        # Analysis mode configurations
│   ├── switch_analysis.py     # Backend switching utility
│   ├── requirements.txt       # OpenAI dependencies
│   └── uploads/               # Uploaded CSV files
├── script/                     # Sample data files
│   ├── comments1.csv
│   ├── comments2.csv
│   └── ...
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.12+** with pip
- **Node.js 16+** with npm
- **OpenAI API Key** (for OpenAI backend)
- **Git** for version control

### 1. Clone the Repository

```bash
git clone <repository-url>
cd loreal-hackathon-codes
```

### 2. Backend Setup

#### Option A: OpenAI Backend
```bash
cd backend
pip install -r requirements.txt
# Set OPENAI_API_KEY in environment
python main.py
```

#### Option B: Hugging Face Backend
```bash
cd backend
pip install -r requirements_hf.txt
python main_hf.py
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **OpenAI Backend**: http://localhost:8000
- **Hugging Face Backend**: http://localhost:8001
- **API Documentation**: http://localhost:8000/docs or http://localhost:8001/docs

## 🎯 Usage Guide

### 1. Choose Your Backend
- Use the **Model Switcher** on the Analysis page
- **OpenAI**: Best accuracy, requires API key, higher cost
- **Hugging Face**: Free, fast, good accuracy, local processing

### 2. Upload Data
1. Navigate to the **Upload** page
2. Select a CSV file with comment data
3. Click **"Upload File"** to process the data

### 3. Run Analysis
1. Go to the **Analysis** page
2. Select your preferred model (AI or HF)
3. Click **"Start Analysis"** to begin processing
4. Monitor real-time progress
5. Use **"Stop Analysis"** to cancel if needed
6. Use **"Resume Analysis"** to continue from where you stopped

### 4. View Results
1. Check the **Dashboard** for overview statistics
2. Use the **Comments** page to browse analyzed comments
3. Apply filters by sentiment, category, quality score, etc.
4. Search for specific terms or phrases

## ⚡ Performance Features

### Hugging Face Optimizations
- **Batch Processing**: 128 comments per batch
- **Parallel Workers**: 12 concurrent workers
- **Text Caching**: Avoids reprocessing identical comments
- **Model Quantization**: Float16 for faster inference
- **Smart Batching**: Only processes non-cached texts

### Expected Performance

| Comment Count | OpenAI | Hugging Face | Improvement |
|---------------|--------|--------------|-------------|
| 1,000 | ~15-25s | ~10-15s | **40% faster** |
| 10,000 | ~3-5min | ~2-3min | **40% faster** |
| Repeated | Normal | Near-instant | **90% faster** |

## 🔧 Backend Switching

### Easy Backend Management
```bash
# Switch between backends
python switch_analysis.py

# Or use batch files (Windows)
start_openai.bat      # Start OpenAI backend
start_huggingface.bat # Start Hugging Face backend
```

### Backend Features

| Feature | OpenAI | Hugging Face |
|---------|--------|--------------|
| **Sentiment** | ✅ GPT-4o-mini | ✅ DistilBERT |
| **Spam** | ✅ GPT-4o-mini | ✅ DistilBERT |
| **Category** | ✅ GPT-4o-mini | ✅ BART |
| **Quality** | ✅ GPT-4o-mini | ✅ DistilBERT |
| **Cost** | 💰💰💰 API calls | 💰 Free |
| **Speed** | 🐌 Medium | 🚀 Fast |
| **Accuracy** | 🎯 Highest | 🎯 High |

## 📊 API Endpoints

### Core Endpoints

#### Comments
- `POST /api/comments/upload` - Upload CSV file
- `POST /api/comments/search` - Search with filters
- `GET /api/comments` - List all comments

#### Analysis
- `POST /api/analysis/start` - Start analysis
- `GET /api/analysis/status/{analysis_id}` - Get status
- `POST /api/analysis/stop/{analysis_id}` - Stop analysis
- `POST /api/analysis/start` - Resume analysis (with resume_analysis_id)

#### Health & Configuration
- `GET /health` - Health check
- `GET /api/analysis/modes` - Get analysis modes (HF only)
- `POST /api/analysis/mode` - Set analysis mode (HF only)

## 🛡 Configuration

### Environment Variables

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# CORS Settings
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# App Settings
SECRET_KEY=your_secret_key_here
```

### Analysis Modes (Hugging Face)

- **Fast**: Rule-based + HF sentiment only
- **Balanced**: HF models for all tasks (default)
- **Accurate**: Full HF models with higher accuracy

## 🚀 Deployment

### Development
```bash
# Backend (with auto-reload)
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
# or
uvicorn main_hf:app --reload --host 0.0.0.0 --port 8001

# Frontend (with hot-reload)
cd frontend
npm start
```

### Production
```bash
# Backend
pip install fastapi uvicorn[standard] gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Frontend
npm run build
npx serve -s build -l 3000
```

## 🔍 Troubleshooting

### Common Issues

1. **Backend Not Responding**
   - Check if backend is running on correct port
   - Use `python switch_analysis.py` to switch backends
   - Check console for error messages

2. **Model Loading Issues**
   - For HF backend: Install dependencies with `pip install -r requirements_hf.txt`
   - Check Python interpreter and virtual environment
   - Restart backend after installing new dependencies

3. **API Connection Failed**
   - Verify backend is running on correct port
   - Check CORS configuration
   - Use the Model Switcher to switch between backends

### Debug Mode
```bash
# Backend with debug logging
cd backend
python -c "import logging; logging.basicConfig(level=logging.DEBUG)"
python main.py  # or python main_hf.py
```

## 🎉 Key Features

- **✅ Dual AI Support**: OpenAI and Hugging Face backends
- **✅ Real-time Processing**: Live progress tracking
- **✅ Smart Caching**: Avoids redundant processing
- **✅ Batch Optimization**: High-performance batch processing
- **✅ Process Control**: Start, stop, resume analysis
- **✅ Model Switching**: Easy backend switching
- **✅ Advanced Filtering**: Multi-criteria search and filter
- **✅ Responsive UI**: Modern Material-UI interface

## 📈 Future Enhancements

- **Database Integration**: Persistent storage
- **User Authentication**: Multi-user support
- **Advanced Analytics**: ML insights and trends
- **Export Functionality**: CSV/Excel export
- **Real-time Collaboration**: Multiple users monitoring

## 📄 License

This project is developed for L'Oréal's hackathon and is proprietary software.

## 🆘 Support

For technical support:
1. Check the API documentation: http://localhost:8000/docs or http://localhost:8001/docs
2. Review console logs for errors
3. Verify environment setup and dependencies
4. Use the Model Switcher to try different backends