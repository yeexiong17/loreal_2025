import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  PlayArrow,
  Computer,
  Terminal,
  Info
} from '@mui/icons-material';

interface BackendInstructionsProps {
  show?: boolean;
}

const BackendInstructions: React.FC<BackendInstructionsProps> = ({ show = true }) => {
  if (!show) return null;
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <Computer sx={{ mr: 1, verticalAlign: 'middle' }} />
          How to Start a Backend
        </Typography>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Both backends show "Disconnected" because no backend is currently running.</strong>
            <br />
            You need to start a backend before you can use the analysis features.
          </Typography>
        </Alert>

        <Typography variant="h6" gutterBottom>
          Method 1: Using Batch Files (Easiest)
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <PlayArrow color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="For OpenAI Backend"
              secondary="Double-click 'start_openai.bat' in the project root folder"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <PlayArrow color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="For Hugging Face Backend"
              secondary="Double-click 'start_huggingface.bat' in the project root folder"
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Method 2: Using Terminal
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <Terminal color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Open Terminal/Command Prompt"
              secondary="Navigate to the backend folder and run the commands below"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <PlayArrow color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Start OpenAI Backend"
              secondary="python main.py (runs on port 8000)"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <PlayArrow color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Start Hugging Face Backend"
              secondary="python main_hf.py (runs on port 8001)"
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Method 3: Using Backend Switcher
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <Terminal color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Run Backend Switcher"
              secondary="cd backend && python switch_analysis.py"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <Info color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Choose Option"
              secondary="Select 1 for OpenAI or 2 for Hugging Face"
            />
          </ListItem>
        </List>

        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Once a backend is running:</strong><br/>
            • The status will change to "Connected"<br/>
            • You can switch between backends using the switcher<br/>
            • Analysis features will become available
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default BackendInstructions;
