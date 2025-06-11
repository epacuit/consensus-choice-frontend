import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  FormControlLabel,
  Checkbox,
  FormHelperText,
} from '@mui/material';
import {
  Send as SendIcon,
  Feedback as FeedbackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const Feedback = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generalError, setGeneralError] = useState('');
  
  const [formData, setFormData] = useState({
    type: 'feature',
    subject: '',
    description: '',
    email: '',
    name: '',
    receive_updates: false,
  });

  const [fieldErrors, setFieldErrors] = useState({
    subject: '',
    description: '',
    email: '',
  });

  const handleChange = (field) => (event) => {
    const value = field === 'receive_updates' ? event.target.checked : event.target.value;
    setFormData({ ...formData, [field]: value });
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors({ ...fieldErrors, [field]: '' });
    }
    setGeneralError('');
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
      isValid = false;
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
      isValid = false;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setGeneralError('');
    
    try {
      await API.post('/feedback', formData);
      setSuccess(true);
      
      // Reset form after 3 seconds and redirect
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setGeneralError(err.response?.data?.detail || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Container maxWidth="sm">
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <FeedbackIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Thank You!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Your feedback has been submitted successfully. We appreciate your input!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Redirecting to home page...
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: '134.195px', minHeight: '100vh', alignItems: 'center' }}>
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 8, lg: 12 } }}>
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 4, md: 6, lg: 8 }, maxWidth: 1200, mx: 'auto' }}>
          <Typography variant="h3" component="h1" sx={{ mb: 2 }}>
            Submit Feedback
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>
            We value your feedback! Help us improve Consensus Choice Voting by sharing your thoughts, 
            reporting issues, or suggesting new features.
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Feedback Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={handleChange('type')}
                    label="Feedback Type"
                  >
                    <MenuItem value="feature">Feature Request</MenuItem>
                    <MenuItem value="bug">Bug Report</MenuItem>
                    <MenuItem value="question">Question</MenuItem>
                    <MenuItem value="general">General Feedback</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Your Name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  helperText="Optional"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Subject"
                  value={formData.subject}
                  onChange={handleChange('subject')}
                  placeholder="Brief summary of your feedback"
                  error={!!fieldErrors.subject}
                  helperText={fieldErrors.subject}
                />
              </Grid>
              
            </Grid>
            
            {/* Description field outside of grid for full width */}
            <Box sx={{ mt: 4, mb: 4, mx: -2 }}>
              <TextField
                fullWidth
                required
                multiline
                rows={10}
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
                placeholder={
                  formData.type === 'bug' 
                    ? "Please describe what happened, what you expected to happen, and steps to reproduce the issue."
                    : "Please provide as much detail as possible."
                }
                error={!!fieldErrors.description}
                helperText={fieldErrors.description}
                sx={{
                  '& .MuiInputBase-root': {
                    alignItems: 'flex-start',
                  },
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1.1rem',
                  }
                }}
              />
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={handleChange('email')}
                  helperText={fieldErrors.email || "Optional - Include if you'd like a response"}
                  error={!!fieldErrors.email}
                />
              </Grid>
              
              {formData.email && (
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.receive_updates}
                        onChange={handleChange('receive_updates')}
                      />
                    }
                    label="I'd like to receive updates about Consensus Choice Voting"
                  />
                </Grid>
              )}
            </Grid>

            {generalError && (
              <Alert severity="error" sx={{ mt: 3 }} onClose={() => setGeneralError('')}>
                {generalError}
              </Alert>
            )}

            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
              >
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default Feedback;