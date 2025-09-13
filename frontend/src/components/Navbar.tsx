import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  Container,
  Avatar,
  Badge,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Comment as CommentIcon,
  Analytics as AnalyticsIcon,
  Upload as UploadIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  AutoAwesome as BrandIcon,
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
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ py: 0.5, minHeight: '56px !important' }}>
          {/* Brand Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1.5,
              }}
            >
              <BrandIcon sx={{ fontSize: 18, color: 'white' }} />
            </Box>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 600,
                fontSize: '1.1rem',
                color: 'text.primary',
                letterSpacing: '-0.025em',
              }}
            >
              L'Oréal Analytics
            </Typography>
          </Box>

          {/* Analysis Status Indicator */}
          {isAnalysisRunning && (
            <Chip
              icon={<RefreshIcon sx={{ animation: 'spin 2s linear infinite', fontSize: 16 }} />}
              label={`Analyzing ${analysisStatus?.processed_comments || 0}/${analysisStatus?.total_comments || 0}`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{
                mr: 2,
                fontWeight: 500,
                fontSize: '0.75rem',
                height: 24,
                '& .MuiChip-icon': {
                  animation: 'spin 2s linear infinite',
                },
              }}
            />
          )}

          {/* Navigation */}
          <Box sx={{ display: 'flex', gap: 0.25, ml: 'auto' }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  fontWeight: location.pathname === item.path ? 600 : 500,
                  color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                  backgroundColor: location.pathname === item.path
                    ? 'primary.50'
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: location.pathname === item.path ? 'primary.100' : 'grey.100',
                    color: 'primary.main',
                  },
                  transition: 'all 0.2s ease-in-out',
                  minWidth: 'auto',
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
