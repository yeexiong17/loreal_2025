import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Psychology as AIIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';

interface BackendInfo {
  status: string;
  ai_enabled: boolean;
  analysis_mode: string;
  model_source: string;
  hf_available?: boolean;
}

const BackendStatus: React.FC = () => {
  const [backendInfo, setBackendInfo] = useState<BackendInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkBackend = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getHealth();
      setBackendInfo(response);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend');
      setBackendInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkBackend();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'unhealthy': return 'error';
      default: return 'default';
    }
  };

  const getModelSourceInfo = (modelSource: string) => {
    switch (modelSource) {
      case 'openai':
        return {
          name: 'OpenAI API',
          icon: <AIIcon />,
          color: 'primary' as const,
          description: 'Using OpenAI GPT models via API calls',
          cost: 'Paid per API call',
          speed: 'Moderate (API dependent)',
        };
      case 'huggingface':
        return {
          name: 'Hugging Face',
          icon: <SpeedIcon />,
          color: 'secondary' as const,
          description: 'Using local Hugging Face models',
          cost: 'Free (runs locally)',
          speed: 'Fast (200-1000 comments/min)',
        };
      case 'rule_based':
        return {
          name: 'Rule-Based',
          icon: <SpeedIcon />,
          color: 'success' as const,
          description: 'Using rule-based analysis algorithms',
          cost: 'Free (no external dependencies)',
          speed: 'Very Fast (1000+ comments/min)',
        };
      default:
        return {
          name: 'Unknown',
          icon: <ErrorIcon />,
          color: 'default' as const,
          description: 'Unknown model source',
          cost: 'Unknown',
          speed: 'Unknown',
        };
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={20} />
            <Typography>Checking backend connection...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={checkBackend}>
              <RefreshIcon sx={{ mr: 1 }} />
              Retry
            </Button>
          }>
            <Typography variant="h6" gutterBottom>
              Backend Connection Failed
            </Typography>
            <Typography variant="body2">
              {error}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Make sure a backend is running on the configured port.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!backendInfo) {
    return null;
  }

  const modelInfo = getModelSourceInfo(backendInfo.model_source);

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Backend Status
          </Typography>
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={checkBackend}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Chip
            icon={backendInfo.status === 'healthy' ? <CheckIcon /> : <ErrorIcon />}
            label={backendInfo.status.toUpperCase()}
            color={getStatusColor(backendInfo.status) as any}
            size="small"
          />
          <Chip
            icon={modelInfo.icon}
            label={modelInfo.name}
            color={modelInfo.color}
            size="small"
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary" paragraph>
            {modelInfo.description}
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
            <Box>
              <Typography variant="caption" color="textSecondary">
                Cost
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {modelInfo.cost}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="textSecondary">
                Speed
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {modelInfo.speed}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="caption" color="textSecondary">
            Analysis Mode:
          </Typography>
          <Chip
            label={backendInfo.analysis_mode}
            size="small"
            variant="outlined"
          />
        </Box>

        {backendInfo.hf_available !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="textSecondary">
              Hugging Face Available:
            </Typography>
            <Chip
              icon={backendInfo.hf_available ? <CheckIcon /> : <ErrorIcon />}
              label={backendInfo.hf_available ? 'Yes' : 'No'}
              color={backendInfo.hf_available ? 'success' : 'error'}
              size="small"
            />
          </Box>
        )}

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Current Backend:</strong> {modelInfo.name} on port {window.location.port === '3000' ? '8000' : '8001'}
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default BackendStatus;
