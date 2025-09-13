import axios from 'axios';
import { 
  DashboardStats, 
  Comment, 
  CommentSearchResponse, 
  CommentFilters, 
  AnalysisRequest, 
  AnalysisStatus, 
  UploadResult,
  ConfigurationData,
  ApiResponse 
} from '../types';
import { getCurrentApiUrl, backendSwitcher } from './backendSwitcher';

// Create API instance that will be updated dynamically
const api = axios.create({
  baseURL: getCurrentApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to update API base URL when backend changes
export const updateApiBaseUrl = () => {
  api.defaults.baseURL = getCurrentApiUrl();
};

// Listen for backend changes and automatically update API URL
backendSwitcher.addListener((backend) => {
  console.log('Backend changed, updating API URL to:', backend.url);
  api.defaults.baseURL = backend.url;
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Health check
  getHealth: () => api.get('/health').then(res => res.data),
  
  // Dashboard
  getDashboardStats: (): Promise<DashboardStats> => 
    api.get('/api/dashboard/stats').then(res => res.data),
  getSentimentDistribution: () => api.get('/api/dashboard/sentiment-distribution').then(res => res.data),
  getCategoryDistribution: () => api.get('/api/dashboard/category-distribution').then(res => res.data),
  getQualityTrends: (days = 30) => api.get(`/api/dashboard/quality-trends?days=${days}`).then(res => res.data),
  getTopVideos: (limit = 10) => api.get(`/api/dashboard/top-videos?limit=${limit}`).then(res => res.data),

  // Comments
  getComments: (params = {}) => api.get('/api/comments', { params }).then(res => res.data),
  getComment: (commentId: string): Promise<Comment> => 
    api.get(`/api/comments/${commentId}`).then(res => res.data),
  getCommentAnalysis: (commentId: string) => api.get(`/api/comments/${commentId}/analysis`).then(res => res.data),
  searchComments: (query: string, filters: CommentFilters = {}, skip = 0, limit = 100): Promise<CommentSearchResponse> => 
    api.post('/api/comments/search', { query, filters, skip, limit }).then(res => res.data),
  uploadComments: (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/comments/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },

  // Analysis
  startAnalysis: (request: AnalysisRequest): Promise<{ analysis_id: string; status: string }> => 
    api.post('/api/analysis/start', request).then(res => res.data),
  resumeAnalysis: (analysisId: string): Promise<{ analysis_id: string; status: string }> => 
    api.post('/api/analysis/start', { resume_analysis_id: analysisId }).then(res => res.data),
  stopAnalysis: (analysisId: string): Promise<{ message: string; analysis_id: string }> => 
    api.post(`/api/analysis/stop/${analysisId}`).then(res => res.data),
  getAnalysisStatus: (analysisId: string): Promise<AnalysisStatus> => 
    api.get(`/api/analysis/status/${analysisId}`).then(res => res.data),
  calculateQualityScores: (commentIds: string[]) => 
    api.post('/api/analysis/quality-score', { comment_ids: commentIds }).then(res => res.data),
  analyzeSentiment: (commentIds: string[]) => 
    api.post('/api/analysis/sentiment-analysis', { comment_ids: commentIds }).then(res => res.data),
  categorizeComments: (commentIds: string[]) => 
    api.post('/api/analysis/categorization', { comment_ids: commentIds }).then(res => res.data),
  detectSpam: (commentIds: string[]) => 
    api.post('/api/analysis/spam-detection', { comment_ids: commentIds }).then(res => res.data),

  // Analysis Modes
  getAnalysisModes: () => api.get('/api/analysis/modes').then(res => res.data),
  setAnalysisMode: (mode: string) => api.post('/api/analysis/mode', { mode }).then(res => res.data),

  // Configuration
  getConfiguration: (): Promise<ConfigurationData> => 
    api.get('/api/configuration').then(res => res.data),
  saveConfiguration: (config: ConfigurationData): Promise<ApiResponse<ConfigurationData>> => 
    api.post('/api/configuration', config).then(res => res.data),
};

export default api;
