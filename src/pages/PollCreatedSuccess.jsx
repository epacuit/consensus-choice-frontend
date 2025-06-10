import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  IconButton,
  Alert,
  Divider,
  Card,
  CardContent,
  Tooltip,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Grid,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  ContentCopy as CopyIcon,
  AdminPanelSettings as AdminIcon,
  Poll as PollIcon,
  HowToVote as VoteIcon,
  Link as LinkIcon,
  Share as ShareIcon,
  Launch as LaunchIcon,
  Warning as WarningIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import API from '../services/api';

const PollCreatedSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pollId, pollTitle, authMethod, adminToken, creatorEmail } = location.state || {};
  
  const [copiedField, setCopiedField] = useState('');
  const [pollData, setPollData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Generate URLs
  const baseUrl = window.location.origin;
  const voteUrl = `${baseUrl}/vote/${pollId}`;
  const resultsUrl = `${baseUrl}/results/${pollId}`;
  const adminUrl = adminToken ? `${baseUrl}/admin/${pollId}?token=${adminToken}` : `${baseUrl}/admin/${pollId}`;
  const myPollsUrl = creatorEmail ? `${baseUrl}/my-polls/${encodeURIComponent(creatorEmail)}` : null;

  useEffect(() => {
    const fetchPollData = async () => {
      if (!pollId) return;
      
      try {
        const response = await API.get(`/polls/${pollId}`);
        setPollData(response.data);
      } catch (error) {
        console.error('Error fetching poll data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPollData();
  }, [pollId]);

  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!pollId) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          No poll information found. Please create a new poll.
        </Alert>
      </Container>
    );
  }

  const isPublicPoll = !loading && pollData && !pollData.is_private;

  return (
    <Box sx={{ mt: '134.195px', minHeight: '100vh' }}>
    
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 4 }}>
        {/* Success Header */}
        <Box display="flex" alignItems="center" mb={3}>
          <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mr: 2 }} />
          <Box flex={1}>
            <Typography variant="h4" component="h1">
              Poll Created Successfully!
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {pollTitle && `"${pollTitle}"`}
            </Typography>
          </Box>
          <Chip
            icon={isPublicPoll ? <PublicIcon /> : <LockIcon />}
            label={isPublicPoll ? 'Public Poll' : 'Private Poll'}
            color={isPublicPoll ? 'success' : 'warning'}
            variant="outlined"
          />
        </Box>

        <Alert severity="success" sx={{ mb: 3 }}>
          Your poll has been created and is ready to receive votes. 
          {isPublicPoll ? ' Share the voting link below with participants.' : ' Invited voters will receive email notifications.'}
        </Alert>

        {/* Quick Action Buttons */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              startIcon={<VoteIcon />}
              endIcon={<LaunchIcon />}
              onClick={() => window.open(voteUrl, '_blank')}
              fullWidth
              sx={{ 
                py: 1.5,
                backgroundColor: 'success.main',
                '&:hover': {
                  backgroundColor: 'success.dark',
                }
              }}
            >
              Go to Voting Page
            </Button>
            <Button
              variant="contained"
              startIcon={<PollIcon />}
              endIcon={<LaunchIcon />}
              onClick={() => window.open(resultsUrl, '_blank')}
              fullWidth
              sx={{ 
                py: 1.5,
                backgroundColor: 'hsl(8.96, 78.57%, 38.43%)',
                '&:hover': {
                  backgroundColor: 'hsl(8.96, 78.57%, 33%)',
                }
              }}
            >
              View Results
            </Button>
            <Button
              variant="contained"
              startIcon={<AdminIcon />}
              endIcon={<LaunchIcon />}
              onClick={() => window.open(adminUrl, '_blank')}
              fullWidth
              sx={{ 
                py: 1.5,
                backgroundColor: 'grey.600',
                '&:hover': {
                  backgroundColor: 'grey.700',
                }
              }}
            >
              Admin Dashboard
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Share Section - Only for Public Polls */}
        {isPublicPoll && (
          <>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <ShareIcon sx={{ mr: 1, color: 'success.main' }} />
                Share Your Poll
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Copy this link to share your poll with voters:
              </Typography>
              <Card variant="outlined" sx={{ backgroundColor: 'rgba(76, 175, 80, 0.08)', borderColor: 'success.main' }}>
                <CardContent>
                  <TextField
                    fullWidth
                    value={voteUrl}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title={copiedField === 'share' ? 'Copied!' : 'Copy link'}>
                            <IconButton
                              onClick={() => copyToClipboard(voteUrl, 'share')}
                              edge="end"
                              color={copiedField === 'share' ? 'success' : 'default'}
                            >
                              <CopyIcon />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                      sx: {
                        fontFamily: 'monospace',
                        backgroundColor: 'background.paper',
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </Box>
            <Divider sx={{ my: 3 }} />
          </>
        )}

        {/* Admin Access Section */}
        <Box sx={{ mb: 4 }}>
          {authMethod === 'none' && (
            <>
              <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2, backgroundColor: 'rgba(255, 152, 0, 0.15)', color: 'text.primary' }}>
                <Typography variant="body2">
                  <strong>Important:</strong> Save this admin link! It's the only way to manage your poll.
                </Typography>
              </Alert>
              
              <Card variant="outlined" sx={{ backgroundColor: 'rgba(158, 158, 158, 0.08)', borderColor: 'grey.400' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <AdminIcon sx={{ mr: 1, color: 'grey.700' }} />
                    Admin Access Link
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Use this link to manage your poll:
                  </Typography>
                  <TextField
                    fullWidth
                    value={adminUrl}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title={copiedField === 'admin' ? 'Copied!' : 'Copy admin link'}>
                            <IconButton
                              onClick={() => copyToClipboard(adminUrl, 'admin')}
                              edge="end"
                              color={copiedField === 'admin' ? 'success' : 'default'}
                            >
                              <CopyIcon />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                      sx: {
                        fontFamily: 'monospace',
                        backgroundColor: 'background.paper',
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </>
          )}

          {authMethod === 'password' && (
            <>
              <Alert severity="info" icon={<LockIcon />} sx={{ mb: 2, backgroundColor: 'rgba(177, 74, 38, 0.15)', color: 'text.primary' }}>
                <Typography variant="body2">
                  <strong>Admin Access:</strong> You can access the admin panel using your password or the direct link below.
                </Typography>
              </Alert>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ backgroundColor: 'rgba(177, 74, 38, 0.08)', borderColor: 'hsl(8.96, 78.57%, 38.43%)', height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <LockIcon sx={{ mr: 1, color: 'hsl(8.96, 78.57%, 38.43%)' }} />
                        Password Access
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Go to the admin page and enter your password to access the dashboard.
                      </Typography>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => navigate(`/admin/${pollId}`)}
                        sx={{ 
                          backgroundColor: 'hsl(8.96, 78.57%, 38.43%)',
                          '&:hover': {
                            backgroundColor: 'hsl(8.96, 78.57%, 33%)',
                          }
                        }}
                      >
                        Go to Admin Login
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ backgroundColor: 'rgba(158, 158, 158, 0.08)', borderColor: 'grey.400', height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <LinkIcon sx={{ mr: 1, color: 'grey.700' }} />
                        Direct Link (Backup)
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Save this link to access without password:
                      </Typography>
                      <TextField
                        fullWidth
                        value={adminUrl}
                        size="small"
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <InputAdornment position="end">
                              <Tooltip title={copiedField === 'admin-backup' ? 'Copied!' : 'Copy link'}>
                                <IconButton
                                  onClick={() => copyToClipboard(adminUrl, 'admin-backup')}
                                  edge="end"
                                  size="small"
                                  color={copiedField === 'admin-backup' ? 'success' : 'default'}
                                >
                                  <CopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </InputAdornment>
                          ),
                          sx: {
                            fontFamily: 'monospace',
                            backgroundColor: 'background.paper',
                          }
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </>
          )}

          {authMethod === 'email' && (
            <>
              <Alert severity="success" icon={<EmailIcon />} sx={{ mb: 2, backgroundColor: 'rgba(76, 175, 80, 0.15)', color: 'text.primary' }}>
                <Typography variant="body2">
                  <strong>Success!</strong> This poll has been added to your dashboard at {creatorEmail}
                </Typography>
              </Alert>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ backgroundColor: 'rgba(76, 175, 80, 0.08)', borderColor: 'success.main', height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmailIcon sx={{ mr: 1, color: 'success.main' }} />
                        Your Polls Dashboard
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        View and manage all your polls in one place.
                      </Typography>
                      {myPollsUrl && (
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => window.open(myPollsUrl, '_blank')}
                          sx={{ 
                            backgroundColor: 'success.main',
                            '&:hover': {
                              backgroundColor: 'success.dark',
                            }
                          }}
                        >
                          View All My Polls
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ backgroundColor: 'rgba(158, 158, 158, 0.08)', borderColor: 'grey.400', height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <LinkIcon sx={{ mr: 1, color: 'grey.700' }} />
                        Direct Admin Link
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Quick access to this poll's admin panel:
                      </Typography>
                      <TextField
                        fullWidth
                        value={adminUrl}
                        size="small"
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <InputAdornment position="end">
                              <Tooltip title={copiedField === 'admin-direct' ? 'Copied!' : 'Copy link'}>
                                <IconButton
                                  onClick={() => copyToClipboard(adminUrl, 'admin-direct')}
                                  edge="end"
                                  size="small"
                                  color={copiedField === 'admin-direct' ? 'success' : 'default'}
                                >
                                  <CopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </InputAdornment>
                          ),
                          sx: {
                            fontFamily: 'monospace',
                            backgroundColor: 'background.paper',
                          }
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* All Links Reference */}
        <Box>
          <Box display="flex" alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" mb={2} flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
            <Box>
              <Typography variant="h6" gutterBottom>
                All Poll Links
              </Typography>
              <Typography variant="body2" color="text.secondary">
                For your reference, here are all the links for your poll:
              </Typography>
            </Box>
            <Tooltip title="Copies all links and admin key to clipboard in a formatted text">
              <Button
                variant="contained"
                startIcon={copiedField === 'all-links' ? <CheckCircleIcon /> : <CopyIcon />}
                onClick={() => {
                  let allLinks = `Poll: ${pollTitle || 'Untitled Poll'}\n\nVoting Page:\n${voteUrl}\n\nResults Page:\n${resultsUrl}\n\nAdmin Dashboard:\n${adminUrl}`;
                  
                  if (authMethod === 'none') {
                    allLinks += '\n\nIMPORTANT: Save the admin link above - it\'s the only way to manage your poll!';
                  } else if (authMethod === 'password') {
                    allLinks += '\n\nAccess: Use your password or the direct link above';
                  } else if (authMethod === 'email' && myPollsUrl) {
                    allLinks += `\n\nYour Polls Dashboard:\n${myPollsUrl}`;
                  }
                  
                  copyToClipboard(allLinks, 'all-links');
                }}
                sx={{
                  backgroundColor: copiedField === 'all-links' ? 'success.main' : 'grey.700',
                  '&:hover': {
                    backgroundColor: copiedField === 'all-links' ? 'success.dark' : 'grey.800',
                  },
                  alignSelf: { xs: 'stretch', sm: 'auto' },
                  transition: 'all 0.3s ease'
                }}
              >
                {copiedField === 'all-links' ? 'All Links Copied!' : 'Copy All Links'}
              </Button>
            </Tooltip>
          </Box>
          
          <Stack spacing={2}>
            {/* Voting Link */}
            <Card variant="outlined" sx={{ backgroundColor: 'rgba(76, 175, 80, 0.04)' }}>
              <CardContent sx={{ py: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" flex={1}>
                    <VoteIcon sx={{ mr: 2, color: 'success.main' }} />
                    <Box flex={1}>
                      <Typography variant="subtitle2">Voting Page</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        {voteUrl}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(voteUrl, 'vote-ref')}
                    color={copiedField === 'vote-ref' ? 'success' : 'default'}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>

            {/* Results Link */}
            <Card variant="outlined" sx={{ backgroundColor: 'hsla(8.96, 78.57%, 38.43%, 0.04)' }}>
              <CardContent sx={{ py: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" flex={1}>
                    <PollIcon sx={{ mr: 2, color: 'hsl(8.96, 78.57%, 38.43%)' }} />
                    <Box flex={1}>
                      <Typography variant="subtitle2">Results Page</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        {resultsUrl}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(resultsUrl, 'results-ref')}
                    color={copiedField === 'results-ref' ? 'success' : 'default'}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>

            {/* Admin Link */}
            <Card variant="outlined" sx={{ borderColor: 'grey.400', backgroundColor: 'rgba(158, 158, 158, 0.04)' }}>
              <CardContent sx={{ py: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" flex={1}>
                    <AdminIcon sx={{ mr: 2, color: 'grey.600' }} />
                    <Box flex={1}>
                      <Typography variant="subtitle2">Admin Dashboard</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        {adminUrl}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(adminUrl, 'admin-ref')}
                    color={copiedField === 'admin-ref' ? 'success' : 'default'}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        {/* Navigation Buttons */}
        <Box display="flex" justifyContent="center" gap={2} mt={4}>
          <Button
            variant="outlined"
            startIcon={<LinkIcon />}
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
          <Button
            variant="contained"
            startIcon={<PollIcon />}
            onClick={() => navigate('/create')}
          >
            Create Another Poll
          </Button>
        </Box>
      </Paper>
    </Container>
    </Box>
  );
};

export default PollCreatedSuccess;