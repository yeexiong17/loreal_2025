import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Chip,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Comment as CommentIcon,
  Analytics as AnalyticsIcon,
  Error as ErrorIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { Comment, CommentFilters, DashboardStats } from '../types';
import { useAnalysis } from '../contexts/AnalysisContext';

const Comments: React.FC = () => {
  const { analysisStatus, isAnalysisRunning } = useAnalysis();
  const [comments, setComments] = useState<Comment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CommentFilters>({
    sentiment: '',
    category: '',
    is_spam: '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use mock data instead of API call
      const mockComments: Comment[] = [
        {
          comment_id: '1',
          video_id: 'video_001',
          text_original: 'Love this new foundation! The coverage is amazing and it lasts all day. Perfect for my oily skin.',
          like_count: 1247,
          published_at: '2024-01-15T10:30:00Z',
          analysis: {
            sentiment: 'positive',
            category: 'makeup',
            quality_score: 0.85,
            is_spam: false,
            created_at: '2024-01-15T10:35:00Z'
          }
        },
        {
          comment_id: '2',
          video_id: 'video_002',
          text_original: 'The packaging is beautiful but the product didn\'t work for me. Too expensive for what it does.',
          like_count: 89,
          published_at: '2024-01-14T15:45:00Z',
          analysis: {
            sentiment: 'negative',
            category: 'packaging',
            quality_score: 0.65,
            is_spam: false,
            created_at: '2024-01-14T15:50:00Z'
          }
        },
        {
          comment_id: '3',
          video_id: 'video_003',
          text_original: 'Great customer service! They helped me find the perfect shade for my skin tone.',
          like_count: 234,
          published_at: '2024-01-13T09:20:00Z',
          analysis: {
            sentiment: 'positive',
            category: 'customer_service',
            quality_score: 0.92,
            is_spam: false,
            created_at: '2024-01-13T09:25:00Z'
          }
        },
        {
          comment_id: '4',
          video_id: 'video_004',
          text_original: 'BUY NOW!!! AMAZING DEAL!!! CLICK HERE!!!',
          like_count: 2,
          published_at: '2024-01-12T20:15:00Z',
          analysis: {
            sentiment: 'neutral',
            category: 'promotion',
            quality_score: 0.15,
            is_spam: true,
            created_at: '2024-01-12T20:20:00Z'
          }
        },
        {
          comment_id: '5',
          video_id: 'video_005',
          text_original: 'The skincare routine has really improved my skin texture. I can see the difference after just one week.',
          like_count: 567,
          published_at: '2024-01-11T14:30:00Z',
          analysis: {
            sentiment: 'positive',
            category: 'skincare',
            quality_score: 0.88,
            is_spam: false,
            created_at: '2024-01-11T14:35:00Z'
          }
        },
        {
          comment_id: '6',
          video_id: 'video_006',
          text_original: 'It\'s okay, nothing special. Expected more from this brand.',
          like_count: 45,
          published_at: '2024-01-10T11:45:00Z',
          analysis: {
            sentiment: 'neutral',
            category: 'product_quality',
            quality_score: 0.55,
            is_spam: false,
            created_at: '2024-01-10T11:50:00Z'
          }
        },
        {
          comment_id: '7',
          video_id: 'video_007',
          text_original: 'The fragrance is too strong for my taste. Gave me a headache.',
          like_count: 123,
          published_at: '2024-01-09T16:20:00Z',
          analysis: {
            sentiment: 'negative',
            category: 'fragrance',
            quality_score: 0.72,
            is_spam: false,
            created_at: '2024-01-09T16:25:00Z'
          }
        },
        {
          comment_id: '8',
          video_id: 'video_008',
          text_original: 'Amazing hair care products! My hair has never looked better. Highly recommend!',
          like_count: 789,
          published_at: '2024-01-08T13:10:00Z',
          analysis: {
            sentiment: 'positive',
            category: 'haircare',
            quality_score: 0.91,
            is_spam: false,
            created_at: '2024-01-08T13:15:00Z'
          }
        },
        {
          comment_id: '9',
          video_id: 'video_009',
          text_original: 'The price point is reasonable for the quality you get. Good value for money.',
          like_count: 156,
          published_at: '2024-01-07T08:30:00Z',
          analysis: {
            sentiment: 'positive',
            category: 'price_value',
            quality_score: 0.78,
            is_spam: false,
            created_at: '2024-01-07T08:35:00Z'
          }
        },
        {
          comment_id: '10',
          video_id: 'video_010',
          text_original: 'Worst product ever! Complete waste of money. Don\'t buy this!',
          like_count: 67,
          published_at: '2024-01-06T19:45:00Z',
          analysis: {
            sentiment: 'negative',
            category: 'product_quality',
            quality_score: 0.35,
            is_spam: false,
            created_at: '2024-01-06T19:50:00Z'
          }
        }
      ];

      // Simulate filtering
      let filteredComments = mockComments;

      if (searchQuery) {
        filteredComments = filteredComments.filter(comment =>
          comment.text_original.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      if (filters.sentiment) {
        filteredComments = filteredComments.filter(comment =>
          comment.analysis?.sentiment === filters.sentiment
        );
      }

      if (filters.category) {
        filteredComments = filteredComments.filter(comment =>
          comment.analysis?.category === filters.category
        );
      }

      if (filters.is_spam) {
        const isSpam = filters.is_spam === 'true';
        filteredComments = filteredComments.filter(comment =>
          comment.analysis?.is_spam === isSpam
        );
      }

      // Simulate pagination
      const startIndex = (page - 1) * 10;
      const endIndex = startIndex + 10;
      const paginatedComments = filteredComments.slice(startIndex, endIndex);

      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setComments(paginatedComments);
      setTotalCount(filteredComments.length);
      setTotalPages(Math.ceil(filteredComments.length / 10));
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      setError('Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, page]);

  useEffect(() => {
    fetchComments();
    fetchDashboardStats();
  }, [fetchComments]);

  useEffect(() => {
    // Refresh dashboard stats when analysis status changes
    if (analysisStatus?.status === 'completed' || analysisStatus?.status === 'stopped') {
      fetchDashboardStats();
    }
  }, [analysisStatus?.status]);

  // Refresh stats periodically when analysis is running
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalysisRunning) {
      interval = setInterval(() => {
        fetchDashboardStats();
      }, 5000); // Refresh every 5 seconds during analysis
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalysisRunning]);

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);

      // Use mock data instead of API call
      const mockStats: DashboardStats = {
        total_comments: 125847,
        total_videos: 2847,
        analyzed_comments: 98723,
        positive_sentiment_ratio: 0.45,
        negative_sentiment_ratio: 0.25,
        neutral_sentiment_ratio: 0.30,
        average_quality_score: 0.78,
        spam_ratio: 0.12,
        top_categories: [
          { category: 'Product Quality', count: 15420 },
          { category: 'Customer Service', count: 12350 },
          { category: 'Price & Value', count: 9870 },
          { category: 'Brand Experience', count: 7650 },
          { category: 'Packaging', count: 5430 }
        ],
        comment_timeline: [
          { date: '2024-01-01', count: 1200, quality_avg: 0.75 },
          { date: '2024-01-02', count: 1350, quality_avg: 0.78 },
          { date: '2024-01-03', count: 1100, quality_avg: 0.72 },
          { date: '2024-01-04', count: 1450, quality_avg: 0.80 },
          { date: '2024-01-05', count: 1600, quality_avg: 0.82 },
          { date: '2024-01-06', count: 1300, quality_avg: 0.76 },
          { date: '2024-01-07', count: 1400, quality_avg: 0.79 }
        ],
        quality_distribution: [
          { range: '0-20%', count: 1250 },
          { range: '21-40%', count: 2100 },
          { range: '41-60%', count: 3500 },
          { range: '61-80%', count: 4200 },
          { range: '81-100%', count: 3800 }
        ]
      };

      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 300));

      setDashboardStats(mockStats);
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchComments();
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ sentiment: '', category: '', is_spam: '' });
    setSearchQuery('');
    setPage(1);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'success';
      case 'negative': return 'error';
      case 'neutral': return 'default';
      default: return 'default';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = ['primary', 'secondary', 'success', 'warning', 'info'];
    const index = category.length % colors.length;
    return colors[index];
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.6s ease-out' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Comments Analysis
          </Typography>

          {/* Compact Status Bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isAnalysisRunning && (
              <Chip
                icon={<CircularProgress size={16} sx={{ color: 'inherit' }} />}
                label={`Analyzing ${analysisStatus?.processed_comments || 0}/${analysisStatus?.total_comments || 0}`}
                color="primary"
                variant="outlined"
                sx={{
                  fontWeight: 500,
                  '& .MuiChip-icon': { animation: 'spin 2s linear infinite' }
                }}
              />
            )}

            {error && (
              <Chip
                icon={<ErrorIcon />}
                label="Connection Error"
                color="error"
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Main Content Layout */}
      <Grid container spacing={3}>
        {/* Left Sidebar - Filters */}
        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 3,
              height: 'fit-content',
              position: 'sticky',
              top: 24,
              '&:hover': {
                boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 40, height: 40 }}>
                <FilterIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Filters
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Refine your search
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Search */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Search Comments
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Search comments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <Button
                        onClick={handleSearch}
                        startIcon={<SearchIcon />}
                        size="small"
                        sx={{
                          mr: -1,
                          borderRadius: '0 8px 8px 0',
                          minWidth: 'auto',
                          px: 1.5,
                        }}
                      >
                        Search
                      </Button>
                    ),
                  }}
                />
              </Box>

              {/* Sentiment Filter */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Sentiment
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={filters.sentiment}
                    onChange={(e) => handleFilterChange('sentiment', e.target.value)}
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    <MenuItem value="">All Sentiments</MenuItem>
                    <MenuItem value="positive">Positive</MenuItem>
                    <MenuItem value="negative">Negative</MenuItem>
                    <MenuItem value="neutral">Neutral</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Category Filter */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Category
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    <MenuItem value="skincare">Skincare</MenuItem>
                    <MenuItem value="makeup">Makeup</MenuItem>
                    <MenuItem value="fragrance">Fragrance</MenuItem>
                    <MenuItem value="haircare">Haircare</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Spam Filter */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Spam Status
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={filters.is_spam}
                    onChange={(e) => handleFilterChange('is_spam', e.target.value)}
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    <MenuItem value="">All Comments</MenuItem>
                    <MenuItem value="false">Not Spam</MenuItem>
                    <MenuItem value="true">Spam Only</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Clear Filters Button */}
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={handleClearFilters}
                sx={{
                  borderRadius: 2,
                  borderWidth: 2,
                  mt: 2,
                  '&:hover': {
                    borderWidth: 2,
                  },
                }}
              >
                Clear All Filters
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Right Side - Main Content */}
        <Grid item xs={12} md={9}>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0px 20px 25px rgba(0, 0, 0, 0.1), 0px 10px 10px rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 40, height: 40 }}>
                      <CommentIcon />
                    </Avatar>
                    <Typography color="textSecondary" sx={{ fontWeight: 500 }}>
                      Total Comments
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statsLoading ? (
                      <CircularProgress size={32} />
                    ) : (
                      dashboardStats?.total_comments?.toLocaleString() || totalCount.toLocaleString()
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0px 20px 25px rgba(0, 0, 0, 0.1), 0px 10px 10px rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2, width: 40, height: 40 }}>
                      <AnalyticsIcon />
                    </Avatar>
                    <Typography color="textSecondary" sx={{ fontWeight: 500 }}>
                      Analyzed
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statsLoading ? (
                      <CircularProgress size={32} />
                    ) : (
                      dashboardStats?.analyzed_comments?.toLocaleString() || 0
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0px 20px 25px rgba(0, 0, 0, 0.1), 0px 10px 10px rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'error.main', mr: 2, width: 40, height: 40 }}>
                      <ErrorIcon />
                    </Avatar>
                    <Typography color="textSecondary" sx={{ fontWeight: 500 }}>
                      Spam Detected
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statsLoading ? (
                      <CircularProgress size={32} />
                    ) : (
                      dashboardStats ? Math.round(dashboardStats.spam_ratio * dashboardStats.analyzed_comments).toLocaleString() : 0
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0px 20px 25px rgba(0, 0, 0, 0.1), 0px 10px 10px rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'warning.main', mr: 2, width: 40, height: 40 }}>
                      <CheckIcon />
                    </Avatar>
                    <Typography color="textSecondary" sx={{ fontWeight: 500 }}>
                      Avg Quality
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statsLoading ? (
                      <CircularProgress size={32} />
                    ) : (
                      dashboardStats ? (dashboardStats.average_quality_score * 100).toFixed(1) + '%' : '0%'
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Comments Table */}
          <Paper
            sx={{
              '&:hover': {
                boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
              },
            }}
          >
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2, width: 40, height: 40 }}>
                  <CommentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Comments
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Browse and analyze comment data
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => {
                  fetchComments();
                  fetchDashboardStats();
                }}
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                  },
                }}
              >
                Refresh
              </Button>
            </Box>


            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Comment</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Sentiment</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Quality</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Likes</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Spam</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : comments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="textSecondary">No comments found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    comments.map((comment, index) => (
                      <TableRow
                        key={comment.comment_id}
                        sx={{
                          '&:hover': {
                            bgcolor: 'grey.50',
                          },
                          '&:nth-of-type(even)': {
                            bgcolor: 'grey.25',
                          },
                        }}
                      >
                        <TableCell sx={{ py: 2 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 300,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              lineHeight: 1.5,
                            }}
                          >
                            {comment.text_original || 'No text'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          {comment.analysis?.sentiment ? (
                            <Chip
                              label={comment.analysis.sentiment}
                              color={getSentimentColor(comment.analysis.sentiment) as any}
                              size="small"
                              sx={{ fontWeight: 500 }}
                            />
                          ) : (
                            <Chip
                              label="Pending Analysis"
                              color="default"
                              variant="outlined"
                              size="small"
                              sx={{ fontWeight: 500, opacity: 0.7 }}
                            />
                          )}
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          {comment.analysis?.category ? (
                            <Chip
                              label={comment.analysis.category}
                              color={getCategoryColor(comment.analysis.category) as any}
                              size="small"
                              sx={{ fontWeight: 500 }}
                            />
                          ) : (
                            <Chip
                              label="Pending Analysis"
                              color="default"
                              variant="outlined"
                              size="small"
                              sx={{ fontWeight: 500, opacity: 0.7 }}
                            />
                          )}
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          {comment.analysis?.quality_score ? (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body2" sx={{ fontWeight: 500, mr: 1 }}>
                                {(comment.analysis.quality_score * 100).toFixed(1)}%
                              </Typography>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 4,
                                  bgcolor: 'grey.200',
                                  borderRadius: 2,
                                  overflow: 'hidden',
                                }}
                              >
                                <Box
                                  sx={{
                                    width: `${comment.analysis.quality_score * 100}%`,
                                    height: '100%',
                                    bgcolor: comment.analysis.quality_score > 0.7 ? 'success.main' :
                                      comment.analysis.quality_score > 0.4 ? 'warning.main' : 'error.main',
                                  }}
                                />
                              </Box>
                            </Box>
                          ) : (
                            <Chip
                              label="Pending Analysis"
                              color="default"
                              variant="outlined"
                              size="small"
                              sx={{ fontWeight: 500, opacity: 0.7 }}
                            />
                          )}
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {comment.like_count.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(comment.published_at).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          {comment.analysis?.is_spam === true ? (
                            <Chip
                              label="Spam"
                              color="error"
                              size="small"
                              sx={{ fontWeight: 500 }}
                            />
                          ) : comment.analysis?.is_spam === false ? (
                            <Chip
                              label="Not Spam"
                              color="success"
                              size="small"
                              sx={{ fontWeight: 500 }}
                            />
                          ) : (
                            <Chip
                              label="Pending Analysis"
                              color="default"
                              variant="outlined"
                              size="small"
                              sx={{ fontWeight: 500, opacity: 0.7 }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 3,
              borderTop: '1px solid #e2e8f0',
              bgcolor: 'grey.50',
            }}>
              <Typography variant="body2" color="text.secondary">
                Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, totalCount)} of {totalCount.toLocaleString()} comments
              </Typography>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: 2,
                    fontWeight: 500,
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Comments;
