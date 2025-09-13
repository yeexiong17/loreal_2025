import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Comment as CommentIcon,
  Analytics as AnalyticsIcon,
  Upload as UploadIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAnalysis } from '../contexts/AnalysisContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { analysisStatus, isAnalysisRunning } = useAnalysis();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { label: 'Comments', path: '/comments', icon: <CommentIcon /> },
    { label: 'Analysis', path: '/analysis', icon: <AnalyticsIcon /> },
    { label: 'Upload', path: '/upload', icon: <UploadIcon /> },
    { label: 'Configuration', path: '/configuration', icon: <SettingsIcon /> },
  ];

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontWeight: 'bold' }}
        >
          Comment Analysis Dashboard
        </Typography>
        
        {/* Analysis Status Indicator */}
        {isAnalysisRunning && (
          <Chip
            icon={<RefreshIcon />}
            label={`Analyzing... ${analysisStatus?.processed_comments || 0}/${analysisStatus?.total_comments || 0}`}
            color="primary"
            variant="outlined"
            sx={{ mr: 2, color: 'white', borderColor: 'white' }}
          />
        )}
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
