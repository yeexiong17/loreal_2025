import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider
} from '@mui/material';
import {
  Speed,
  Psychology,
  AttachMoney,
  CheckCircle,
  Settings
} from '@mui/icons-material';
import AnalysisModeSelector from './AnalysisModeSelector';
import BackendStatus from './BackendStatus';

interface ModelSpecificOptionsProps {
  currentBackend: any;
}

const ModelSpecificOptions: React.FC<ModelSpecificOptionsProps> = ({ currentBackend }) => {
  const isHF = currentBackend.name === 'Hugging Face';

  return (
    <Box>
      {/* Analysis Mode Selector - Only for Hugging Face */}
      {isHF && (
        <Box sx={{ mb: 2 }}>
          <AnalysisModeSelector />
        </Box>
      )}

      {/* Backend Status */}
      <Box sx={{ mb: 2 }}>
        <BackendStatus />
      </Box>

      {/* Model-specific information */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Settings sx={{ mr: 1, verticalAlign: 'middle' }} />
            {isHF ? 'Hugging Face' : 'OpenAI'} Configuration
          </Typography>

          {isHF ? (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Hugging Face Models Active</strong><br/>
                  All analysis tasks use specialized local models for optimal performance.
                </Typography>
              </Alert>

              <Typography variant="subtitle2" gutterBottom>
                Available Analysis Modes:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Speed color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Fast Mode"
                    secondary="Quick analysis with smaller models"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Balanced Mode"
                    secondary="Good balance of speed and accuracy"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Psychology color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Accurate Mode"
                    secondary="Highest accuracy with larger models"
                  />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Model Details:
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                <Chip label="Sentiment: RoBERTa" size="small" color="primary" variant="outlined" />
                <Chip label="Spam: DialoGPT" size="small" color="primary" variant="outlined" />
                <Chip label="Category: BART" size="small" color="primary" variant="outlined" />
                <Chip label="Quality: DistilBERT" size="small" color="primary" variant="outlined" />
              </Box>
            </Box>
          ) : (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>OpenAI Models Active</strong><br/>
                  All analysis tasks use GPT-4o-mini for maximum accuracy and reliability.
                </Typography>
              </Alert>

              <Typography variant="subtitle2" gutterBottom>
                OpenAI Features:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Psychology color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="GPT-4o-mini"
                    secondary="Advanced language model for all analysis tasks"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="High Accuracy"
                    secondary="Best-in-class analysis quality"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AttachMoney color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="API Usage"
                    secondary="Costs based on token usage"
                  />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Analysis Tasks:
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                <Chip label="Sentiment Analysis" size="small" color="secondary" variant="outlined" />
                <Chip label="Spam Detection" size="small" color="secondary" variant="outlined" />
                <Chip label="Category Classification" size="small" color="secondary" variant="outlined" />
                <Chip label="Quality Scoring" size="small" color="secondary" variant="outlined" />
              </Box>
            </Box>
          )}

        </CardContent>
      </Card>
    </Box>
  );
};

export default ModelSpecificOptions;
