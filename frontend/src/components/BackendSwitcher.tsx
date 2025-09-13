import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  SwapHoriz,
  CheckCircle,
  Error
} from '@mui/icons-material';
import { backendSwitcher, BackendConfig } from '../services/backendSwitcher';

const BackendSwitcher: React.FC = () => {
  const [currentBackend, setCurrentBackend] = useState<BackendConfig>(backendSwitcher.getCurrentBackend());
  const [healthStatus, setHealthStatus] = useState<{ healthy: boolean; info?: any } | null>(null);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    // Add listener for backend changes
    const handleBackendChange = (backend: BackendConfig) => {
      setCurrentBackend(backend);
      checkHealth();
    };

    backendSwitcher.addListener(handleBackendChange);
    checkHealth();

    return () => {
      backendSwitcher.removeListener(handleBackendChange);
    };
  }, []);

  const checkHealth = async () => {
    const status = await backendSwitcher.checkBackendHealth();
    setHealthStatus(status);
  };


  const getStatusIcon = () => {
    if (switching) return <CircularProgress size={20} />;
    if (healthStatus?.healthy) return <CheckCircle color="success" />;
    return <Error color="error" />;
  };

  const getStatusColor = () => {
    if (switching) return 'info';
    if (healthStatus?.healthy) return 'success';
    return 'error';
  };

  const getStatusText = () => {
    if (switching) return 'Switching...';
    if (healthStatus?.healthy) return 'Connected';
    return 'Disconnected';
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" component="h2">
              <SwapHoriz sx={{ mr: 1, verticalAlign: 'middle' }} />
              Backend Switcher
            </Typography>
            <Chip
              icon={getStatusIcon()}
              label={getStatusText()}
              color={getStatusColor() as any}
              size="small"
            />
          </Box>

          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Current: <strong>{currentBackend.name}</strong> - {currentBackend.description}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              URL: {currentBackend.url}
            </Typography>
          </Box>

          <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
            {backendSwitcher.getCurrentBackend().features.map((feature, index) => (
              <Chip
                key={index}
                label={feature}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>

          <Box display="flex" gap={1} mb={2}>
            <Button
              variant="outlined"
              size="small"
              onClick={checkHealth}
              startIcon={<CheckCircle />}
            >
              Check Health
            </Button>
          </Box>

          {!healthStatus?.healthy && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Backend is not responding.</strong><br/>
                Make sure a backend is running on {currentBackend.url}
              </Typography>
            </Alert>
          )}

          {healthStatus?.info && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Model Source:</strong> {healthStatus.info.model_source || 'Unknown'}<br/>
                <strong>AI Enabled:</strong> {healthStatus.info.ai_enabled ? 'Yes' : 'No'}<br/>
                <strong>Analysis Mode:</strong> {healthStatus.info.analysis_mode || 'Unknown'}
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

    </Box>
  );
};

export default BackendSwitcher;
