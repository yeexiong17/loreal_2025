import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Psychology,
  CheckCircle
} from '@mui/icons-material';
import { backendSwitcher } from '../services/backendSwitcher';
import { useAnalysis } from '../contexts/AnalysisContext';

interface ModelSwitcherProps {
  currentBackend: any;
  onBackendChange: (backend: any) => void;
}

const ModelSwitcher: React.FC<ModelSwitcherProps> = ({ currentBackend, onBackendChange }) => {
  const { analysisStatus, stopAnalysis, clearAnalysis } = useAnalysis();
  const [isSwitching, setIsSwitching] = React.useState(false);
  
  const handleModelSwitch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const isHF = event.target.checked;
    const backendName = isHF ? 'Hugging Face' : 'OpenAI';
    
    setIsSwitching(true);
    
    try {
      // If there's a running analysis, stop and clear it first
      if (analysisStatus?.status === 'processing') {
        console.log('Stopping running analysis before switching model');
        await stopAnalysis();
        await clearAnalysis();
      }
      
      const success = backendSwitcher.setBackend(backendName);
      if (success) {
        onBackendChange(backendSwitcher.getCurrentBackend());
        console.log(`Switched to ${backendName} backend`);
      }
    } catch (error) {
      console.error('Failed to switch backend:', error);
    } finally {
      setIsSwitching(false);
    }
  };

  const isHF = currentBackend.name === 'Hugging Face';

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" component="h2">
            <Psychology sx={{ mr: 1, verticalAlign: 'middle' }} />
            Analysis Model
          </Typography>
          <Chip
            icon={<CheckCircle />}
            label={currentBackend.name}
            color={isHF ? "primary" : "secondary"}
            variant="outlined"
          />
        </Box>

        {analysisStatus?.status === 'processing' && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Analysis Running:</strong> Switching models will stop the current analysis and start fresh.
            </Typography>
          </Alert>
        )}

        <FormControlLabel
          control={
            <Switch
              checked={isHF}
              onChange={handleModelSwitch}
              color="primary"
              disabled={isSwitching}
            />
          }
          label={
            <Box display="flex" alignItems="center">
              {isSwitching && <CircularProgress size={16} sx={{ mr: 1 }} />}
              <Box>
                <Typography variant="body1">
                  {isHF ? 'Hugging Face Models' : 'OpenAI Models'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isHF ? 'Local AI models (Free)' : 'Cloud AI models (Paid)'}
                </Typography>
              </Box>
            </Box>
          }
        />

        <Divider sx={{ my: 2 }} />

        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>
            Current Model Features:
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {currentBackend.features.map((feature: string, index: number) => (
              <Chip
                key={index}
                label={feature}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>{isHF ? 'Hugging Face' : 'OpenAI'} Backend:</strong><br/>
            {isHF ? (
              <>
                • All analysis uses local HF models<br/>
                • Free to use, no API costs<br/>
                • Fast processing with specialized models
              </>
            ) : (
              <>
                • All analysis uses OpenAI GPT-4o-mini<br/>
                • Higher accuracy and reliability<br/>
                • Requires API key and has usage costs
              </>
            )}
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default ModelSwitcher;
