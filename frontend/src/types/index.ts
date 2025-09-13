// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Dashboard Types
export interface DashboardStats {
  total_comments: number;
  total_videos: number;
  analyzed_comments: number;
  average_quality_score: number;
  positive_sentiment_ratio: number;
  negative_sentiment_ratio: number;
  neutral_sentiment_ratio: number;
  spam_ratio: number;
  top_categories: Array<{ category: string; count: number }>;
  comment_timeline: Array<{ date: string; count: number; quality_avg: number }>;
  quality_distribution: Array<{ range: string; count: number }>;
}

// Comment Types
export interface Comment {
  comment_id: string;
  text_original: string;
  like_count: number;
  published_at: string;
  video_id: string;
  author_id?: string;
  analysis?: CommentAnalysis;
}

export interface CommentAnalysis {
  quality_score: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  category: string;
  is_spam: boolean;
  confidence_scores?: {
    quality: number;
    sentiment: number;
    category: number;
    spam: number;
  };
  created_at: string;
}

// Analysis Types
export interface AnalysisRequest {
  analysis_types: ('quality' | 'sentiment' | 'categorization' | 'spam')[];
  comment_ids?: string[];
  batch_size?: number;
}

export interface AnalysisStatus {
  analysis_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'stopped';
  progress: number;
  total_comments: number;
  processed_comments: number;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
}

// Upload Types
export interface UploadResult {
  videos_processed: number;
  comments_processed: number;
  total_rows: number;
  errors?: string[];
  warnings?: string[];
}

// Search and Filter Types
export interface CommentFilters {
  sentiment?: string;
  category?: string;
  is_spam?: string;
  quality_min?: number;
  quality_max?: number;
  date_from?: string;
  date_to?: string;
}

export interface CommentSearchResponse {
  comments: Comment[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Configuration Types
export interface ModelConfiguration {
  quality_threshold: number;
  sentiment_confidence_threshold: number;
  spam_threshold: number;
  max_comment_length: number;
  min_comment_length: number;
  batch_size: number;
  enable_auto_analysis: boolean;
}

export interface CategoryKeywords {
  [category: string]: string[];
}

export interface ConfigurationData {
  model: ModelConfiguration;
  keywords: CategoryKeywords;
  updated_at: string;
}

// Chart Data Types
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  count: number;
  quality_avg?: number;
  sentiment_positive?: number;
  sentiment_negative?: number;
  sentiment_neutral?: number;
}

// Error Types
export interface ApiError {
  detail: string;
  code?: string;
  field?: string;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  page_size: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// File Upload Types
export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  file_info: {
    name: string;
    size: number;
    type: string;
    last_modified: string;
  };
}
