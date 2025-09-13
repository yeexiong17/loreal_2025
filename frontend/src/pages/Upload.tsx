import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Grid,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { UploadResult, FileValidationResult, FileUploadProgress } from '../types';

const Upload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<FileValidationResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress | null>(null);

  const validateFile = (file: File): FileValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      errors.push('File must be a CSV file');
    }
    
    // Check file size (200MB limit)
    const maxSize = 200 * 1024 * 1024; // 200MB
    if (file.size > maxSize) {
      errors.push('File size must be less than 200MB');
    } else if (file.size > 100 * 1024 * 1024) { // 100MB
      warnings.push('Large file detected. Upload may take several minutes.');
    }
    
    // Check file name
    if (file.name.includes(' ')) {
      warnings.push('File name contains spaces. Consider using underscores instead.');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      file_info: {
        name: file.name,
        size: file.size,
        type: file.type,
        last_modified: new Date(file.lastModified).toISOString(),
      }
    };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const validationResult = validateFile(selectedFile);
      setFile(selectedFile);
      setValidation(validationResult);
      setError(null);
      setUploadResult(null);
      setUploadProgress(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (validation && !validation.valid) {
      setError('Please fix file validation errors before uploading');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadProgress({ loaded: 0, total: file.size, percentage: 0 });
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (!prev) return prev;
          const newLoaded = Math.min(prev.loaded + (file.size / 20), file.size);
          return {
            loaded: newLoaded,
            total: file.size,
            percentage: (newLoaded / file.size) * 100
          };
        });
      }, 200);

      const result = await apiService.uploadComments(file);
      
      clearInterval(progressInterval);
      setUploadProgress({ loaded: file.size, total: file.size, percentage: 100 });
      setUploadResult(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Upload Comments Data
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upload CSV File
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <input
                accept=".csv"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  size="large"
                  sx={{ mr: 2 }}
                >
                  Select CSV File
                </Button>
              </label>
              
              {file && validation && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Selected: {file.name} ({formatFileSize(file.size)})
                  </Typography>
                  
                  {validation.errors.length > 0 && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>Validation Errors:</Typography>
                      <List dense>
                        {validation.errors.map((error, index) => (
                          <ListItem key={index} sx={{ py: 0 }}>
                            <ListItemText primary={error} />
                          </ListItem>
                        ))}
                      </List>
                    </Alert>
                  )}
                  
                  {validation.warnings.length > 0 && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>Warnings:</Typography>
                      <List dense>
                        {validation.warnings.map((warning, index) => (
                          <ListItem key={index} sx={{ py: 0 }}>
                            <ListItemText primary={warning} />
                          </ListItem>
                        ))}
                      </List>
                    </Alert>
                  )}
                  
                  {validation.valid && validation.warnings.length === 0 && (
                    <Alert severity="success" sx={{ mt: 1 }}>
                      File validation passed. Ready to upload.
                    </Alert>
                  )}
                </Box>
              )}
            </Box>

            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!file || uploading || (validation ? !validation.valid : false)}
              startIcon={<UploadIcon />}
              size="large"
            >
              {uploading ? 'Uploading...' : 'Upload File'}
            </Button>

            {uploading && uploadProgress && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    Uploading... {uploadProgress.percentage.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {formatFileSize(uploadProgress.loaded)} / {formatFileSize(uploadProgress.total)}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={uploadProgress.percentage}
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="textSecondary">
                  Processing file... This may take a few minutes for large files.
                </Typography>
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {uploadResult && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Upload completed successfully!
              </Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload Instructions
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Supported Format"
                    secondary="CSV files only"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Required Columns"
                    secondary="commentId, textOriginal, videoId, etc."
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="File Size"
                    secondary="Up to 200MB supported"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Expected Data Structure
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label="commentId" size="small" />
                <Chip label="textOriginal" size="small" />
                <Chip label="videoId" size="small" />
                <Chip label="authorId" size="small" />
                <Chip label="likeCount" size="small" />
                <Chip label="publishedAt" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {uploadResult && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Upload Results
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Videos Processed
                  </Typography>
                  <Typography variant="h4">
                    {uploadResult.videos_processed}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Comments Processed
                  </Typography>
                  <Typography variant="h4">
                    {uploadResult.comments_processed}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Rows
                  </Typography>
                  <Typography variant="h4">
                    {uploadResult.total_rows}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default Upload;
