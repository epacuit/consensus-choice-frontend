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
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    type: 'feature',
    subject: '',
    description: '',
    email: '',
    name: '',
    receive_updates: false,
  });

  const handleChange = (field) => (event) => {
    const value = field === 'receive_updates' ? event.target.checked : event.target.value;
    setFormData({ ...formData, [field]: value });
    setError('');
  };

  const validateForm = () => {
    if (!formData.subject.trim()) {
      setError('Please provide a subject');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Please provide a description');
      return false;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please provide a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      await API.post('/feedback', formData);
      setSuccess(true);
      
      // Reset form after 3 seconds and redirect
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit feedback');
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
    <Box sx={{ mt: '134.195px', minHeight: '100vh',   alignItems: 'center' }}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 } }}>
          <Box display="flex" alignItems="center" mb={3}>
            <FeedbackIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Typography variant="h3" component="h1">
              Submit Feedback
            </Typography>
          </Box>
          
          <Typography variant="body1" color="text.secondary" paragraph>
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
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  multiline
                  rows={6}
                  label="Description"
                  value={formData.description}
                  onChange={handleChange('description')}
                  placeholder={
                    formData.type === 'bug' 
                      ? "Please describe what happened, what you expected to happen, and steps to reproduce the issue."
                      : "Please provide as much detail as possible."
                  }
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={handleChange('email')}
                  helperText="Optional - Include if you'd like a response"
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

            {error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
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