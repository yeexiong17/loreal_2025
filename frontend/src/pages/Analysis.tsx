import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  LinearProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  CheckCircle as CompleteIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAnalysis } from '../contexts/AnalysisContext';
import BackendInstructions from '../components/BackendInstructions';
import ModelSwitcher from '../components/ModelSwitcher';
import ModelSpecificOptions from '../components/ModelSpecificOptions';
import { backendSwitcher } from '../services/backendSwitcher';

const Analysis: React.FC = () => {
  const { analysisStatus, isAnalysisRunning, canResume, startAnalysis, resumeAnalysis, stopAnalysis, refreshStatus, clearAnalysis } = useAnalysis();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentBackend, setCurrentBackend] = useState(backendSwitcher.getCurrentBackend());
  const [recovered, setRecovered] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);

  // Listen for backend changes
  useEffect(() => {
    const handleBackendChange = (backend: any) => {
      setCurrentBackend(backend);
    };

    backendSwitcher.addListener(handleBackendChange);
    return () => {
      backendSwitcher.removeListener(handleBackendChange);
    };
  }, []);

  // Check backend connection status
  useEffect(() => {
    const checkConnection = async () => {
      const status = await backendSwitcher.checkBackendHealth();
      setBackendConnected(status.healthy);
    };
    
    checkConnection();
    const interval = setInterval(checkConnection, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [currentBackend]);

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

  const handleClearAnalysis = async () => {
    try {
      setLoading(true);
      console.log('Clear analysis clicked');
      await clearAnalysis();
      console.log('Clear analysis completed');
    } catch (err: any) {
      console.error('Clear analysis error:', err);
      setError(err.response?.data?.detail || 'Failed to clear analysis');
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
      case 'stopping': return 'warning';
      case 'processing': return 'primary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CompleteIcon />;
      case 'failed': return <ErrorIcon />;
      case 'stopped': return <StopIcon />;
      case 'stopping': return <StopIcon />;
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
              {canResume ? (
                <Button
                  variant="contained"
                  onClick={handleResumeAnalysis}
                  disabled={loading || isAnalysisRunning}
                  startIcon={<StartIcon />}
                  size="large"
                  color="secondary"
                >
                  {loading ? 'Resuming...' : 'Resume Analysis'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleStartAnalysis}
                  disabled={loading || isAnalysisRunning}
                  startIcon={<StartIcon />}
                  size="large"
                >
                  {loading ? 'Starting...' : 'Start Analysis'}
                </Button>
              )}

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
                  onClick={handleClearAnalysis}
                  disabled={loading}
                  size="large"
                >
                  {loading ? 'Clearing...' : 'Clear Analysis'}
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
                {canResume && ` - You can resume from ${analysisStatus.processed_comments} processed comments`}
              </Alert>
            )}

            {canResume && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Analysis was stopped at {analysisStatus?.processed_comments} out of {analysisStatus?.total_comments} comments. 
                Click "Resume Analysis" to continue from where it left off.
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
          {/* Model Switcher - Main control */}
          <ModelSwitcher 
            currentBackend={currentBackend} 
            onBackendChange={setCurrentBackend} 
          />
          
          {/* Model-specific options */}
          <Box sx={{ mt: 2 }}>
            <ModelSpecificOptions currentBackend={currentBackend} />
          </Box>
          
          {/* Instructions (only show when disconnected) */}
          <Box sx={{ mt: 2 }}>
            <BackendInstructions show={!backendConnected} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analysis;
