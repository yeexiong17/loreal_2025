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
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  CheckCircle as CompleteIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAnalysis } from '../contexts/AnalysisContext';

const Analysis: React.FC = () => {
  const { analysisStatus, isAnalysisRunning, startAnalysis, stopAnalysis, refreshStatus, clearAnalysis } = useAnalysis();
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

  const handleStopAnalysis = async () => {
    try {
      setLoading(true);
      await stopAnalysis();
    } catch (err: any) {
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
    <Box>
      <Typography variant="h4" gutterBottom>
        Comment Analysis
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Run Analysis
            </Typography>
            
            <Typography variant="body1" paragraph>
              Start the AI-powered analysis of your comments. This will perform:
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemText primary="Quality Scoring" secondary="Analyze comment quality based on length, readability, and engagement" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Sentiment Analysis" secondary="Determine if comments are positive, negative, or neutral" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Categorization" secondary="Classify comments into beauty categories (skincare, makeup, etc.)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Spam Detection" secondary="Identify and flag spam comments" />
              </ListItem>
            </List>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleStartAnalysis}
                disabled={loading || isAnalysisRunning}
                startIcon={<StartIcon />}
                size="large"
              >
                {loading ? 'Starting...' : 'Start Analysis'}
              </Button>
              
              {isAnalysisRunning && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleStopAnalysis}
                  startIcon={<StopIcon />}
                  size="large"
                  disabled={loading}
                >
                  {loading ? 'Stopping...' : 'Stop Analysis'}
                </Button>
              )}
              
              {analysisStatus && !isAnalysisRunning && (
                <Button
                  variant="outlined"
                  onClick={refreshStatus}
                  startIcon={<RefreshIcon />}
                  size="large"
                >
                  Refresh Status
                </Button>
              )}
              
              {analysisStatus && (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={clearAnalysis}
                  size="large"
                >
                  Clear Analysis
                </Button>
              )}
            </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {recovered && analysisStatus && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Analysis state recovered from previous session. Current status: {analysisStatus.status}
        </Alert>
      )}
          </Paper>

          {analysisStatus && (
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Analysis Status
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip
                    icon={getStatusIcon(analysisStatus.status)}
                    label={analysisStatus.status.toUpperCase()}
                    color={getStatusColor(analysisStatus.status) as any}
                    sx={{ mr: 2 }}
                  />
                  <Typography variant="body2" color="textSecondary">
                    {analysisStatus.processed_comments} / {analysisStatus.total_comments} comments processed
                  </Typography>
                </Box>
                
                {analysisStatus.status === 'processing' && (
                  <LinearProgress 
                    variant="determinate" 
                    value={analysisStatus.progress} 
                    sx={{ mb: 1 }}
                  />
                )}
                
                <Typography variant="body2" color="textSecondary">
                  Progress: {analysisStatus.progress.toFixed(1)}%
                </Typography>
              </Box>

              {analysisStatus.error_message && (
                <Alert severity="error">
                  {analysisStatus.error_message}
                </Alert>
              )}

              {analysisStatus.status === 'completed' && (
                <Alert severity="success">
                  Analysis completed successfully! You can now view the results in the Comments and Dashboard sections.
                </Alert>
              )}
            </Paper>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Analysis Features
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Quality Scoring
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Evaluates comment quality based on length, readability, engagement, and content quality.
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Sentiment Analysis
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Uses OpenAI GPT to analyze sentiment with beauty/skincare context awareness.
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Categorization
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Automatically categorizes comments into skincare, makeup, fragrance, and haircare.
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Spam Detection
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Machine learning model to identify and filter out spam comments.
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Processing Time
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Analysis time depends on the number of comments:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="1,000 comments" 
                    secondary="~2-3 minutes" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="10,000 comments" 
                    secondary="~15-20 minutes" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="100,000+ comments" 
                    secondary="~2-3 hours" 
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
