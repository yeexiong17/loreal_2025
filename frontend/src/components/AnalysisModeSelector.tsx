import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  LinearProgress,
  Alert,
  Grid,
  Paper,
  Divider,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  CheckCircle as AccuracyIcon,
  AttachMoney as CostIcon,
  Psychology as AIIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { AnalysisModesResponse } from '../types';

interface AnalysisModeSelectorProps {
  onModeChange?: (mode: string) => void;
}

const AnalysisModeSelector: React.FC<AnalysisModeSelectorProps> = ({ onModeChange }) => {
  const [modes, setModes] = useState<AnalysisModesResponse | null>(null);
  const [selectedMode, setSelectedMode] = useState<string>('balanced');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalysisModes();
  }, []);

  const loadAnalysisModes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAnalysisModes();
      console.log('Analysis modes response:', response);
      
      // Validate response structure
      if (!response || !response.modes || !response.performance_estimates) {
        throw new Error('Invalid response structure from backend');
      }
      
      setModes(response);
      setSelectedMode(response.current_mode || 'balanced');
    } catch (err: any) {
      console.error('Error loading analysis modes:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load analysis modes');
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newMode = event.target.value;
    setSelectedMode(newMode);

    try {
      await apiService.setAnalysisMode(newMode);
      if (onModeChange) {
        onModeChange(newMode);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to change analysis mode');
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'fast':
        return <SpeedIcon />;
      case 'accurate':
        return <AccuracyIcon />;
      case 'balanced':
        return <AIIcon />;
      default:
        return <AIIcon />;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'fast':
        return 'success';
      case 'accurate':
        return 'error';
      case 'balanced':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getModeDescription = (mode: string) => {
    switch (mode) {
      case 'fast':
        return 'Fastest processing with basic accuracy. Uses lightweight models and rule-based fallbacks.';
      case 'balanced':
        return 'Balanced speed and accuracy. Uses optimized models for good performance.';
      case 'accurate':
        return 'Highest accuracy with slower processing. Uses advanced models for best results.';
      default:
        return 'Custom configuration for specific needs.';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Analysis Mode Configuration
          </Typography>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Loading analysis modes...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!modes) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Analysis Mode Configuration
          </Typography>
          <Alert severity="warning">
            Analysis modes not available. Using default configuration.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Analysis Mode Configuration
        </Typography>
        
        <Typography variant="body2" color="textSecondary" paragraph>
          Choose the analysis mode that best fits your needs. Different modes offer different 
          trade-offs between speed, accuracy, and cost.
        </Typography>

        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend">Select Analysis Mode</FormLabel>
          <RadioGroup
            value={selectedMode}
            onChange={handleModeChange}
            sx={{ mt: 1 }}
          >
            {modes.modes.map((mode) => {
              const estimates = modes.performance_estimates?.[mode as keyof typeof modes.performance_estimates] || {
                comments_per_minute: 100,
                accuracy: 0.8,
                cost_per_1000: 0
              };
              return (
                <Paper
                  key={mode}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: selectedMode === mode ? 2 : 1,
                    borderColor: selectedMode === mode ? 'primary.main' : 'divider',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                  onClick={() => setSelectedMode(mode)}
                >
                  <FormControlLabel
                    value={mode}
                    control={<Radio />}
                    label={
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {getModeIcon(mode)}
                          <Typography variant="h6" sx={{ ml: 1, textTransform: 'capitalize' }}>
                            {mode} Mode
                          </Typography>
                          {selectedMode === mode && (
                            <Chip
                              label="Active"
                              color={getModeColor(mode) as any}
                              size="small"
                              sx={{ ml: 2 }}
                            />
                          )}
                        </Box>
                        
                        <Typography variant="body2" color="textSecondary" paragraph>
                          {getModeDescription(mode)}
                        </Typography>

                        <Grid container spacing={2}>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center' }}>
                              <SpeedIcon color="action" />
                              <Typography variant="caption" display="block">
                                {estimates.comments_per_minute} comments/min
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                Speed
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center' }}>
                              <AccuracyIcon color="action" />
                              <Typography variant="caption" display="block">
                                {(estimates.accuracy * 100).toFixed(0)}% accuracy
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                Accuracy
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center' }}>
                              <CostIcon color="action" />
                              <Typography variant="caption" display="block">
                                ${estimates.cost_per_1000}/1k comments
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                Cost
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    }
                    sx={{ width: '100%', m: 0 }}
                  />
                </Paper>
              );
            })}
          </RadioGroup>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Current Configuration
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Mode: <strong>{selectedMode}</strong> | 
            Speed: <strong>{modes.performance_estimates?.[selectedMode as keyof typeof modes.performance_estimates]?.comments_per_minute || 100} comments/min</strong> | 
            Accuracy: <strong>{((modes.performance_estimates?.[selectedMode as keyof typeof modes.performance_estimates]?.accuracy || 0.8) * 100).toFixed(0)}%</strong>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AnalysisModeSelector;
