import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import {
  TrendingUp as TrendingUpIcon,
  Comment as CommentIcon,
  VideoLibrary as VideoIcon,
  Analytics as AnalyticsIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { DashboardStats } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Use mock data instead of API call
    const mockData: DashboardStats = {
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
    setTimeout(() => {
      setStats(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard data..." />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!stats) {
    return <Alert severity="info">No data available</Alert>;
  }

  const sentimentData = [
    { name: 'Positive', value: stats.positive_sentiment_ratio * 100, color: '#4caf50' },
    { name: 'Negative', value: stats.negative_sentiment_ratio * 100, color: '#f44336' },
    { name: 'Neutral', value: stats.neutral_sentiment_ratio * 100, color: '#ff9800' },
  ];

  const categoryData = stats.top_categories.map((cat, index) => ({
    name: cat.category,
    value: cat.count,
    color: `hsl(${index * 60}, 70%, 50%)`,
  }));

  return (
    <Box sx={{ animation: 'fadeIn 0.6s ease-out' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, color: 'text.primary' }}>
          Analytics Dashboard
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0px 12px 20px rgba(0, 0, 0, 0.1)',
                borderColor: 'primary.main',
              },
            }}
          >
            <CardContent sx={{ p: 2, position: 'relative', zIndex: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 1.5,
                  }}
                >
                  <CommentIcon sx={{ fontSize: 20, color: 'white' }} />
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.875rem' }}>
                  Total Comments
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, fontSize: '1.75rem', color: 'text.primary' }}>
                {stats.total_comments.toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 14, mr: 0.5, color: 'success.main' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                  +12% from last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0px 12px 20px rgba(0, 0, 0, 0.1)',
                borderColor: 'error.main',
              },
            }}
          >
            <CardContent sx={{ p: 2, position: 'relative', zIndex: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: 'error.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 1.5,
                  }}
                >
                  <VideoIcon sx={{ fontSize: 20, color: 'white' }} />
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.875rem' }}>
                  Total Videos
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, fontSize: '1.75rem', color: 'text.primary' }}>
                {stats.total_videos.toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 14, mr: 0.5, color: 'success.main' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                  +8% from last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0px 12px 20px rgba(0, 0, 0, 0.1)',
                borderColor: 'info.main',
              },
            }}
          >
            <CardContent sx={{ p: 2, position: 'relative', zIndex: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: 'info.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 1.5,
                  }}
                >
                  <AnalyticsIcon sx={{ fontSize: 20, color: 'white' }} />
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.875rem' }}>
                  Analyzed Comments
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, fontSize: '1.75rem', color: 'text.primary' }}>
                {stats.analyzed_comments.toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={(stats.analyzed_comments / stats.total_comments) * 100}
                  sx={{
                    flexGrow: 1,
                    mr: 1,
                    height: 4,
                    borderRadius: 2,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'info.main',
                      borderRadius: 2,
                    },
                  }}
                />
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>
                  {((stats.analyzed_comments / stats.total_comments) * 100).toFixed(1)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0px 12px 20px rgba(0, 0, 0, 0.1)',
                borderColor: 'success.main',
              },
            }}
          >
            <CardContent sx={{ p: 2, position: 'relative', zIndex: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 1.5,
                  }}
                >
                  <CheckIcon sx={{ fontSize: 20, color: 'white' }} />
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.875rem' }}>
                  Avg Quality Score
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, fontSize: '1.75rem', color: 'text.primary' }}>
                {(stats.average_quality_score * 100).toFixed(1)}%
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip
                  label={stats.average_quality_score > 0.7 ? 'Excellent' : stats.average_quality_score > 0.5 ? 'Good' : 'Needs Improvement'}
                  size="small"
                  color={stats.average_quality_score > 0.7 ? 'success' : stats.average_quality_score > 0.5 ? 'warning' : 'error'}
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: 20,
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              '&:hover': {
                boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 40, height: 40 }}>
                <AnalyticsIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Sentiment Distribution
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Overall sentiment breakdown
                </Typography>
              </Box>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              '&:hover': {
                boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', mr: 2, width: 40, height: 40 }}>
                <CommentIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Top Categories
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Most discussed topics
                </Typography>
              </Box>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="url(#colorGradient)"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#764ba2" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              '&:hover': {
                boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2, width: 40, height: 40 }}>
                <TrendingUpIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Comment Activity Timeline
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Comments over time
                </Typography>
              </Box>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.comment_timeline || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="url(#areaGradient)"
                  fill="url(#areaGradient)"
                  fillOpacity={0.3}
                />
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4facfe" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#00f2fe" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              '&:hover': {
                boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2, width: 40, height: 40 }}>
                <CheckIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Quality Distribution
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Comment quality ranges
                </Typography>
              </Box>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.quality_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="range"
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="url(#qualityGradient)"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="qualityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#43e97b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#38f9d7" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              '&:hover': {
                boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2, width: 40, height: 40 }}>
                <AnalyticsIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Key Performance Metrics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Analysis insights
                </Typography>
              </Box>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center" sx={{ p: 2 }}>
                  <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                    {(stats.average_quality_score * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Average Quality Score
                  </Typography>
                  <Chip
                    label={stats.average_quality_score > 0.7 ? 'Excellent' : stats.average_quality_score > 0.5 ? 'Good' : 'Needs Improvement'}
                    size="small"
                    color={stats.average_quality_score > 0.7 ? 'success' : stats.average_quality_score > 0.5 ? 'warning' : 'error'}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center" sx={{ p: 2 }}>
                  <Typography variant="h3" color="error" sx={{ fontWeight: 700 }}>
                    {(stats.spam_ratio * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Spam Ratio
                  </Typography>
                  <Chip
                    label={stats.spam_ratio < 0.1 ? 'Low' : stats.spam_ratio < 0.3 ? 'Moderate' : 'High'}
                    size="small"
                    color={stats.spam_ratio < 0.1 ? 'success' : stats.spam_ratio < 0.3 ? 'warning' : 'error'}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center" sx={{ p: 2 }}>
                  <Typography variant="h3" color="success.main" sx={{ fontWeight: 700 }}>
                    {((stats.analyzed_comments / stats.total_comments) * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Analysis Coverage
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(stats.analyzed_comments / stats.total_comments) * 100}
                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
