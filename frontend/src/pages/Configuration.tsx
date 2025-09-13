import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { ModelConfiguration, CategoryKeywords, ConfigurationData } from '../types';

const Configuration: React.FC = () => {
  const [config, setConfig] = useState<ModelConfiguration>({
    quality_threshold: 0.7,
    sentiment_confidence_threshold: 0.8,
    spam_threshold: 0.6,
    max_comment_length: 1000,
    min_comment_length: 10,
    batch_size: 100,
    enable_auto_analysis: true,
  });

  const [keywords, setKeywords] = useState<CategoryKeywords>({
    skincare: ['moisturizer', 'serum', 'cleanser', 'toner', 'acne', 'wrinkles', 'anti-aging', 'hydrating'],
    makeup: ['foundation', 'lipstick', 'eyeshadow', 'mascara', 'blush', 'concealer', 'primer'],
    fragrance: ['perfume', 'cologne', 'scent', 'fragrance', 'aroma', 'smell'],
    haircare: ['shampoo', 'conditioner', 'hair', 'styling', 'treatment', 'oil', 'serum'],
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newKeyword, setNewKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [addKeywordDialog, setAddKeywordDialog] = useState(false);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      // In a real app, this would load from the backend
      // For now, we'll use the default values
      setConfig({
        quality_threshold: 0.7,
        sentiment_confidence_threshold: 0.8,
        spam_threshold: 0.6,
        max_comment_length: 1000,
        min_comment_length: 10,
        batch_size: 100,
        enable_auto_analysis: true,
      });
    } catch (err) {
      console.error('Error loading configuration:', err);
    }
  };

  const handleConfigChange = (field: keyof ModelConfiguration, value: number) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveConfiguration = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real app, this would save to the backend
      // await apiService.saveConfiguration({ config, keywords });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && selectedCategory) {
      setKeywords(prev => ({
        ...prev,
        [selectedCategory]: [...(prev[selectedCategory] || []), newKeyword.trim().toLowerCase()]
      }));
      setNewKeyword('');
      setAddKeywordDialog(false);
    }
  };

  const handleRemoveKeyword = (category: string, keyword: string) => {
    setKeywords(prev => ({
      ...prev,
      [category]: prev[category].filter(k => k !== keyword)
    }));
  };

  const categories = Object.keys(keywords);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Model Configuration
      </Typography>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Configuration saved successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Model Parameters */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Analysis Parameters
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Quality Threshold"
                  type="number"
                  value={config.quality_threshold}
                  onChange={(e) => handleConfigChange('quality_threshold', parseFloat(e.target.value))}
                  inputProps={{ min: 0, max: 1, step: 0.1 }}
                  helperText="Minimum quality score (0-1) for a comment to be considered high quality"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Sentiment Confidence Threshold"
                  type="number"
                  value={config.sentiment_confidence_threshold}
                  onChange={(e) => handleConfigChange('sentiment_confidence_threshold', parseFloat(e.target.value))}
                  inputProps={{ min: 0, max: 1, step: 0.1 }}
                  helperText="Minimum confidence (0-1) for sentiment analysis results"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Spam Detection Threshold"
                  type="number"
                  value={config.spam_threshold}
                  onChange={(e) => handleConfigChange('spam_threshold', parseFloat(e.target.value))}
                  inputProps={{ min: 0, max: 1, step: 0.1 }}
                  helperText="Threshold (0-1) above which comments are flagged as spam"
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Min Comment Length"
                  type="number"
                  value={config.min_comment_length}
                  onChange={(e) => handleConfigChange('min_comment_length', parseInt(e.target.value))}
                  inputProps={{ min: 1 }}
                  helperText="Minimum characters"
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Max Comment Length"
                  type="number"
                  value={config.max_comment_length}
                  onChange={(e) => handleConfigChange('max_comment_length', parseInt(e.target.value))}
                  inputProps={{ min: 1 }}
                  helperText="Maximum characters"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Category Keywords */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Category Keywords
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setAddKeywordDialog(true)}
                size="small"
              >
                Add Keyword
              </Button>
            </Box>

            <Typography variant="body2" color="textSecondary" paragraph>
              Define keywords that help categorize comments into beauty categories.
            </Typography>

            {categories.map((category) => (
              <Accordion key={category} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                    {category} ({keywords[category].length} keywords)
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {keywords[category].map((keyword) => (
                      <Chip
                        key={keyword}
                        label={keyword}
                        onDelete={() => handleRemoveKeyword(category, keyword)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadConfiguration}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveConfiguration}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Add Keyword Dialog */}
      <Dialog open={addKeywordDialog} onClose={() => setAddKeywordDialog(false)}>
        <DialogTitle>Add New Keyword</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Category"
            select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            sx={{ mt: 2 }}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Keyword"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            sx={{ mt: 2 }}
            onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddKeywordDialog(false)}>Cancel</Button>
          <Button onClick={handleAddKeyword} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Configuration;
