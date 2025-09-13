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
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon, Refresh as RefreshIcon } from '@mui/icons-material';
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
      console.log('Fetching comments with filters:', { searchQuery, filters, page });
      const response = await apiService.searchComments(searchQuery, filters, (page - 1) * 10, 10);
      console.log('Comments response:', response);
      setComments(response.comments);
      setTotalCount(response.total_count);
      setTotalPages(Math.ceil(response.total_count / 10));
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      setError(error.response?.data?.detail || 'Failed to fetch comments');
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
      const stats = await apiService.getDashboardStats();
      setDashboardStats(stats);
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
    <Box>
      <Typography variant="h4" gutterBottom>
        Comments Analysis
      </Typography>

      {/* Analysis Status Indicator */}
      {isAnalysisRunning && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography>
              Analysis is running in the background... {analysisStatus?.processed_comments || 0} / {analysisStatus?.total_comments || 0} comments processed
            </Typography>
          </Box>
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search comments"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                endAdornment: (
                  <Button onClick={handleSearch} startIcon={<SearchIcon />}>
                    Search
                  </Button>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sentiment</InputLabel>
              <Select
                value={filters.sentiment}
                onChange={(e) => handleFilterChange('sentiment', e.target.value)}
                label="Sentiment"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="positive">Positive</MenuItem>
                <MenuItem value="negative">Negative</MenuItem>
                <MenuItem value="neutral">Neutral</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                label="Category"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="skincare">Skincare</MenuItem>
                <MenuItem value="makeup">Makeup</MenuItem>
                <MenuItem value="fragrance">Fragrance</MenuItem>
                <MenuItem value="haircare">Haircare</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Spam</InputLabel>
              <Select
                value={filters.is_spam}
                onChange={(e) => handleFilterChange('is_spam', e.target.value)}
                label="Spam"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="false">Not Spam</MenuItem>
                <MenuItem value="true">Spam</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Comments
              </Typography>
              <Typography variant="h5">
                {statsLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  dashboardStats?.total_comments?.toLocaleString() || totalCount.toLocaleString()
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Analyzed
              </Typography>
              <Typography variant="h5">
                {statsLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  dashboardStats?.analyzed_comments?.toLocaleString() || 0
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Spam Detected
              </Typography>
              <Typography variant="h5">
                {statsLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  dashboardStats ? Math.round(dashboardStats.spam_ratio * dashboardStats.analyzed_comments).toLocaleString() : 0
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg Quality
              </Typography>
              <Typography variant="h5">
                {statsLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  dashboardStats ? (dashboardStats.average_quality_score * 100).toFixed(1) + '%' : '0%'
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Comments Table */}
      <Paper>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Comments</Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              fetchComments();
              fetchDashboardStats();
            }}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {/* Analysis Status Note */}
        {comments.length > 0 && (
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Alert severity="info" sx={{ mb: 0 }}>
              <Typography variant="body2">
                <strong>Note:</strong> Comments without analysis data (empty sentiment, category, quality, and spam fields)
                have not been processed by AI yet. Run the analysis from the Analysis page to get complete insights.
              </Typography>
            </Alert>
          </Box>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Comment</TableCell>
                <TableCell>Sentiment</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Quality</TableCell>
                <TableCell>Likes</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Spam</TableCell>
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
                comments.map((comment) => (
                  <TableRow key={comment.comment_id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {comment.text_original || 'No text'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {comment.analysis?.sentiment && (
                        <Chip
                          label={comment.analysis.sentiment}
                          color={getSentimentColor(comment.analysis.sentiment) as any}
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {comment.analysis?.category && (
                        <Chip
                          label={comment.analysis.category}
                          color={getCategoryColor(comment.analysis.category) as any}
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {comment.analysis?.quality_score && (
                        <Typography variant="body2">
                          {(comment.analysis.quality_score * 100).toFixed(1)}%
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{comment.like_count}</TableCell>
                    <TableCell>
                      {new Date(comment.published_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {comment.analysis?.is_spam && (
                        <Chip label="Spam" color="error" size="small" />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default Comments;
