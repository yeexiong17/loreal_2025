import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  CheckCircle as CompleteIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import { useAnalysis } from '../contexts/AnalysisContext';

const Analysis: React.FC = () => {
  const { analysisStatus, isAnalysisRunning, canResume, startAnalysis, resumeAnalysis, stopAnalysis, refreshStatus, clearAnalysis } = useAnalysis();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recovered, setRecovered] = useState(false);

  const handleStartAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      await startAnalysis();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to start analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      await resumeAnalysis();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to resume analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleStopAnalysis = async () => {
    try {
      setLoading(true);
      console.log('Stop analysis clicked, current status:', analysisStatus);
      await stopAnalysis();
      console.log('Stop analysis completed');
    } catch (err: any) {
      console.error('Stop analysis error:', err);
      setError(err.response?.data?.detail || 'Failed to stop analysis');
    } finally {
      setLoading(false);
    }
  };

  // Check if analysis was recovered from localStorage
  React.useEffect(() => {
    if (analysisStatus && !recovered) {
      setRecovered(true);
    }
  }, [analysisStatus, recovered]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'stopped': return 'warning';
      case 'processing': return 'primary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CompleteIcon />;
      case 'failed': return <ErrorIcon />;
      case 'stopped': return <StopIcon />;
      case 'processing': return <RefreshIcon />;
      default: return <RefreshIcon />;
    }
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.6s ease-out' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary' }}>
            AI Comment Analysis
          </Typography>

          {/* Compact Status Bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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

      {/* Analysis Status - Always Visible */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          '&:hover': {
            boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'info.main', mr: 2, width: 40, height: 40 }}>
            <AnalyticsIcon />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Analysis Status
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {analysisStatus ? 'Real-time progress tracking' : 'Ready to start analysis'}
            </Typography>
          </Box>
          {analysisStatus && (
            <Chip
              icon={getStatusIcon(analysisStatus.status)}
              label={analysisStatus.status.toUpperCase()}
              color={getStatusColor(analysisStatus.status) as any}
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                height: 32,
              }}
            />
          )}
        </Box>

        {analysisStatus ? (
          <>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500, mb: 1 }}>
                  {analysisStatus.processed_comments.toLocaleString()} / {analysisStatus.total_comments.toLocaleString()} comments processed
                </Typography>
                {analysisStatus.status === 'processing' && (
                  <LinearProgress
                    variant="determinate"
                    value={analysisStatus.progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                      },
                    }}
                  />
                )}
                {analysisStatus.status !== 'processing' && (
                  <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600 }}>
                    {analysisStatus.progress.toFixed(1)}% Complete
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                  {canResume && (
                    <Button
                      variant="contained"
                      onClick={handleResumeAnalysis}
                      disabled={loading || isAnalysisRunning}
                      startIcon={<StartIcon />}
                      size="large"
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        px: 3,
                        py: 1.5,
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      {loading ? 'Resuming...' : 'Resume Analysis'}
                    </Button>
                  )}
                  {isAnalysisRunning && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleStopAnalysis}
                      startIcon={<StopIcon />}
                      size="small"
                      disabled={loading}
                      sx={{
                        borderWidth: 2,
                        '&:hover': { borderWidth: 2 },
                      }}
                    >
                      {loading ? 'Stopping...' : 'Stop'}
                    </Button>
                  )}
                  {analysisStatus && !isAnalysisRunning && (
                    <Button
                      variant="outlined"
                      onClick={refreshStatus}
                      startIcon={<RefreshIcon />}
                      size="small"
                      sx={{
                        borderWidth: 2,
                        '&:hover': { borderWidth: 2 },
                      }}
                    >
                      Refresh
                    </Button>
                  )}
                  {analysisStatus && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={clearAnalysis}
                      size="small"
                      sx={{
                        borderWidth: 2,
                        '&:hover': { borderWidth: 2 },
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>

            {analysisStatus.error_message && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {analysisStatus.error_message}
                </Typography>
              </Alert>
            )}

            {analysisStatus.status === 'completed' && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Analysis completed successfully! View results in Comments and Dashboard sections.
                </Typography>
              </Alert>
            )}

            {recovered && analysisStatus && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Analysis state recovered from previous session. Current status: {analysisStatus.status}
                {canResume && ` - You can resume from ${analysisStatus.processed_comments} processed comments`}
              </Alert>
            )}

            {canResume && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Analysis was stopped at {analysisStatus?.processed_comments} out of {analysisStatus?.total_comments} comments.
                Click "Resume Analysis" to continue from where it left off.
              </Alert>
            )}
          </>
        ) : (
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
                No analysis has been started yet. Click "Start Analysis" to begin processing your comments.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Button
                  variant="contained"
                  onClick={handleStartAnalysis}
                  disabled={loading || isAnalysisRunning}
                  startIcon={<StartIcon />}
                  size="large"
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    px: 3,
                    py: 1.5,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {loading ? 'Starting...' : 'Start Analysis'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        )}
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
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
                <StartIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Start Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Run comprehensive AI analysis on your comment dataset
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2, width: 32, height: 32 }}>
                    <CompleteIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Quality Scoring
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Analyze comment quality and engagement
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                  <Avatar sx={{ bgcolor: 'info.main', mr: 2, width: 32, height: 32 }}>
                    <AnalyticsIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Sentiment Analysis
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Determine positive, negative, or neutral sentiment
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2, width: 32, height: 32 }}>
                    <CommentIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Categorization
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Classify into beauty categories
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                  <Avatar sx={{ bgcolor: 'error.main', mr: 2, width: 32, height: 32 }}>
                    <ErrorIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Spam Detection
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Identify and flag spam comments
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Use the action buttons in the Analysis Status section above to start, resume, or control your analysis.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              mb: 3,
              '&:hover': {
                boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2, width: 40, height: 40 }}>
                  <RefreshIcon />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Processing Time
                </Typography>
              </Box>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>
                        1K
                      </Typography>
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary="1,000 comments"
                    secondary="~2-3 minutes"
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>
                        10K
                      </Typography>
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary="10,000 comments"
                    secondary="~15-20 minutes"
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'error.main', width: 32, height: 32 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>
                        100K+
                      </Typography>
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary="100,000+ comments"
                    secondary="~2-3 hours"
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analysis;
