import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Import pages
import Dashboard from './pages/Dashboard';
import Comments from './pages/Comments';
import Analysis from './pages/Analysis';
import Upload from './pages/Upload';
import Configuration from './pages/Configuration';

// Import components
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import { AnalysisProvider } from './contexts/AnalysisContext';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AnalysisProvider>
          <Router>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/comments" element={<Comments />} />
                  <Route path="/analysis" element={<Analysis />} />
                  <Route path="/upload" element={<Upload />} />
                  <Route path="/configuration" element={<Configuration />} />
                </Routes>
              </Box>
            </Box>
          </Router>
        </AnalysisProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;