import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  TextField,
  useMediaQuery,
    useTheme,
    Tooltip,

} from '@mui/material';
import {
  Settings as SettingsIcon,
  BarChart as ChartIcon,
  CloudUpload as UploadIcon,
  History as HistoryIcon,
  Lock as LockIcon,
  ExitToApp as LogoutIcon,
  Security as SecurityIcon,
  DeleteForever as DeleteForeverIcon,
  ClearAll as ClearAllIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import API from '../services/api';

// Import shared components
import AdminSettingsTab from '../components/admin/AdminSettingsTab';
import AdminAnalyticsTab from '../components/admin/AdminAnalyticsTab';
import AdminBulkImportTab from '../components/admin/AdminBulkImportTab';
import AdminAuditLogTab from '../components/admin/AdminAuditLogTab';
import EmailListInput from '../components/shared/EmailListInput';
import { uploadImage } from '../utils/imageUploadUtils';

// Tab panels
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}


const AdminHeader = ({ poll, onNavigate, onLogout, onDeletePoll, onDeleteBallots, analytics })  => {
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box mb={3}>
      {/* Header Row */}
      <Box
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
        gap={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Poll Administration
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {poll?.title || 'Loading...'}
          </Typography>
        </Box>
        
        <Chip
          icon={<SecurityIcon />}
          label="Administrator Mode"
          color="success"
        />
      </Box>

      {/* Action Buttons */}
      <Box
        display="flex"
        justifyContent="center"
        gap={1}
        flexWrap="wrap"
      >
        <Button
          variant="outlined"
          onClick={() => onNavigate(`/results/${poll?.id}`)}
        >
          View Results
        </Button>

      <Button
        variant="outlined"
        onClick={() => onNavigate(`/vote/${poll?.id}`)}
      >
        Vote Page
      </Button>
      <Button
        variant="outlined"
        color="error"
        onClick={onDeletePoll}
        startIcon={<DeleteForeverIcon />}
      >
        Delete Poll
      </Button>
      <Tooltip title={!analytics || analytics.totalVotes === 0 ? "No ballots to clear" : "Delete all votes from this poll"}>
        <span>
          <Button
            variant="outlined"
            color="warning"
            onClick={onDeleteBallots}
            startIcon={<ClearAllIcon />}
            disabled={!analytics || analytics.totalVotes === 0}
          >
            Clear Ballots {analytics && analytics.totalVotes > 0 && `(${analytics.totalVotes})`}
          </Button>
        </span>
      </Tooltip>
      <Button
        variant="outlined"
        color="error"
        onClick={onLogout}
        startIcon={<LogoutIcon />}
      >
        Logout
      </Button>
      </Box>
    </Box>
  );
};


// Auth Dialog Component
const AuthDialog = ({ open, onClose, onAuthenticate, error }) => {
  const [adminPassword, setAdminPassword] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const fullScreen = useMediaQuery(theme => theme.breakpoints.down('sm'));

  const handleAuthenticate = () => {
    onAuthenticate({
      password: activeTab === 0 ? adminPassword : null,
      token: activeTab === 1 ? adminToken : null
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        <LockIcon sx={{ mr: 1 }} />
        Admin Authentication Required
      </DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          Please authenticate to access poll administration features.
        </Alert>
        
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
          <Tab label="Password" />
          <Tab label="Admin Link" />
        </Tabs>
        
        {activeTab === 0 && (
          <TextField
            fullWidth
            type="password"
            label="Admin Password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleAuthenticate();
            }}
            autoFocus
            helperText="Enter the password you set when creating the poll"
          />
        )}
        
        {activeTab === 1 && (
          <TextField
            fullWidth
            type="text"
            label="Admin Token"
            value={adminToken}
            onChange={(e) => setAdminToken(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleAuthenticate();
            }}
            autoFocus
            helperText="Paste the admin token from your admin link"
          />
        )}
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Back to Vote
        </Button>
        <Button
          onClick={handleAuthenticate}
          variant="contained"
          disabled={!adminPassword && !adminToken}
        >
          Authenticate
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Admin = () => {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fullScreenDialogs = useMediaQuery(theme => theme.breakpoints.down('sm'));
  
  // Get token from URL if present
  const urlParams = new URLSearchParams(location.search);
  const tokenFromUrl = urlParams.get('token');
  
  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [poll, setPoll] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [uploadingImages, setUploadingImages] = useState({});
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authDialog, setAuthDialog] = useState(true);
  const [authError, setAuthError] = useState('');
  const [adminSession, setAdminSession] = useState(null);
  
  // Edit mode for poll settings - Initialize with proper structure
  const [editMode, setEditMode] = useState(false);
  const [editedPoll, setEditedPoll] = useState(null);
  const [dataReady, setDataReady] = useState(false);
  
  // Delete confirmation dialogs
  const [deletePollDialog, setDeletePollDialog] = useState(false);
  const [deleteBallotsDialog, setDeleteBallotsDialog] = useState(false);
  
  // Audit log state
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Email management state
  const [voterEmails, setVoterEmails] = useState([]);
  const [emailTokens, setEmailTokens] = useState({});
  const [regeneratingToken, setRegeneratingToken] = useState({});

  // Load data
useEffect(() => {
  const initializeAdmin = async () => {
    if (tokenFromUrl) {
      await authenticateWithToken(tokenFromUrl);
    } else {
      const session = sessionStorage.getItem('adminSession');
      if (session) {
        const parsedSession = JSON.parse(session);
        if (parsedSession.pollId === pollId) {
          setAdminSession(parsedSession);
          setIsAuthenticated(true);
          setAuthDialog(false);
          await loadPollData();
          await loadAnalytics();
        }
      } else {
        // NO TOKEN AND NO SESSION - THIS IS THE MISSING PART
        setLoading(false);
        setIsAuthenticated(false);
        setAuthDialog(true);
      }
    }
  };
  
  initializeAdmin();
}, [pollId, tokenFromUrl]);

  
  // Auto-refresh analytics
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 1 && isAuthenticated) {
        loadAnalytics();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [activeTab, isAuthenticated]);
  
  // Load audit logs when switching to that tab
  useEffect(() => {
    if (activeTab === 3 && isAuthenticated && auditLogs.length === 0) {
      loadAuditLogs();
    }
  }, [activeTab, isAuthenticated]);
  
  // Authentication functions
  const authenticateWithToken = async (token) => {
    try {
      const response = await API.post('/polls/authenticate-admin', {
        poll_id: pollId,
        admin_token: token
      });
      
      if (response.data.authenticated) {
        const session = {
          authenticated: true,
          timestamp: new Date().toISOString(),
          pollId: pollId,
          authMethod: response.data.auth_method,
          adminToken: token
        };
        sessionStorage.setItem('adminSession', JSON.stringify(session));
        setAdminSession(session);
        setIsAuthenticated(true);
        setAuthDialog(false);
        logAdminAction('LOGIN', 'Admin authenticated via token');
        await loadPollData();
        await loadAnalytics();
      }
    } catch (err) {
      setAuthError('Invalid admin token');
      setAuthDialog(true);
    }
  };
  
  const handleAuthenticate = async ({ password, token }) => {
    try {
      const authData = { poll_id: pollId };
      
      if (password) {
        authData.password = password;
      } else if (token) {
        authData.admin_token = token;
      } else {
        setAuthError('Please enter a password or admin token');
        return;
      }
      
      const response = await API.post('/polls/authenticate-admin', authData);
      
      if (response.data.authenticated) {
        const session = {
          authenticated: true,
          timestamp: new Date().toISOString(),
          pollId: pollId,
          authMethod: response.data.auth_method,
          adminToken: token
        };
        sessionStorage.setItem('adminSession', JSON.stringify(session));
        setAdminSession(session);
        setIsAuthenticated(true);
        setAuthDialog(false);
        setAuthError('');
        logAdminAction('LOGIN', `Admin authenticated via ${response.data.auth_method}`);
        await loadPollData();
        await loadAnalytics();
      }
    } catch (err) {
      setAuthError(err.response?.data?.detail || 'Authentication failed');
    }
  };
  
  const handleLogout = () => {
    sessionStorage.removeItem('adminSession');
    setIsAuthenticated(false);
    setAdminSession(null);
    setAuthDialog(true);
    setAuthError('');
    logAdminAction('LOGOUT', 'Admin logged out');
  };
  
  // Log admin actions
  const logAdminAction = async (action, details, metadata = {}) => {
    const logEntry = {
      action,
      details,
      metadata,
      timestamp: new Date().toISOString(),
      pollId,
      adminSession
    };
    
    console.log('Admin Action:', logEntry);
    
    const logs = JSON.parse(localStorage.getItem(`audit_${pollId}`) || '[]');
    logs.push(logEntry);
    localStorage.setItem(`audit_${pollId}`, JSON.stringify(logs));
  };
  
  const loadAuditLogs = () => {
    setLoadingAudit(true);
    try {
      const logs = JSON.parse(localStorage.getItem(`audit_${pollId}`) || '[]');
      setAuditLogs(logs.reverse());
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoadingAudit(false);
    }
  };
  
  const loadPollData = async () => {

    try {
      setDataReady(false);
      const response = await API.get(`/polls/${pollId}`);
      const pollData = response.data;
      
      // Convert closing_datetime to dayjs object if it exists
      const processedPollData = {
        ...pollData,
        closing_datetime: pollData.closing_datetime 
          ? dayjs(pollData.closing_datetime) 
          : null,
        // Ensure settings object exists with all required properties
        settings: {
          allow_ties: true,
          require_complete_ranking: false,
          randomize_options: false,
          allow_write_in: pollData.is_private ? false : (pollData.settings?.allow_write_in ?? false),
          show_detailed_results: true,
          show_rankings: true,
          results_visibility: 'public',
          can_view_before_close: false,
          ...pollData.settings
        }
      };
      
      setPoll(processedPollData);
      setEditedPoll(processedPollData);
      
      // Load voter emails if private poll
      if (pollData.is_private) {
        await loadVoterEmails();
      }
      
      setLoading(false);
      setDataReady(true);
    } catch (err) {
      console.error('Failed to load poll data:', err);
      setError('Failed to load poll data');
      setLoading(false);
      setDataReady(false);
    }
  };

  const loadVoterEmails = async () => {
    try {
      const authData = getAuthData();
      const response = await API.get(`/polls/${pollId}/voters`, {
        params: authData
      });
      
      const emails = response.data.voters.map(v => v.email);
      const tokens = {};
      response.data.voters.forEach(v => {
        tokens[v.email] = v.token;
      });
      
      setVoterEmails(emails);
      setEmailTokens(tokens);
    } catch (err) {
      console.error('Failed to load voter emails:', err);
    }
  };

  const regenerateVoterToken = async (email) => {
    try {
      setRegeneratingToken(prev => ({ ...prev, [email]: true }));
      
      const authData = getAuthData();
      const response = await API.post(`/polls/${pollId}/regenerate-token`, {
        ...authData,
        email: email
      });
      
      setEmailTokens(prev => ({
        ...prev,
        [email]: response.data.token
      }));
      
      logAdminAction('REGENERATE_TOKEN', `Regenerated token for ${email}`);
      setSuccess(`New voting link generated for ${email}`);
    } catch (err) {
      setError('Failed to regenerate token: ' + (err.response?.data?.detail || err.message));
    } finally {
      setRegeneratingToken(prev => ({ ...prev, [email]: false }));
    }
  };

  const updateVoterEmails = async (newEmails) => {
    try {
      const authData = getAuthData();
      
      // Add new emails
      const emailsToAdd = newEmails.filter(email => !voterEmails.includes(email));
      if (emailsToAdd.length > 0) {
        await API.post(`/polls/${pollId}/voters`, {
          ...authData,
          emails: emailsToAdd
        });
      }
      
      // Remove deleted emails
      const emailsToRemove = voterEmails.filter(email => !newEmails.includes(email));
      for (const email of emailsToRemove) {
        await API.delete(`/polls/${pollId}/voters/${email}`, {
          data: authData
        });
      }
      
      await loadVoterEmails();
      logAdminAction('UPDATE_VOTERS', `Updated voter list: added ${emailsToAdd.length}, removed ${emailsToRemove.length}`);
    } catch (err) {
      setError('Failed to update voter emails: ' + (err.response?.data?.detail || err.message));
    }
  };
  
  const loadAnalytics = async () => {
    try {
      const resultsResponse = await API.get(`/ballots/poll/${pollId}/results`);
      
      const analytics = {
        totalVotes: resultsResponse.data.total_ballots,
        testVotes: resultsResponse.data.total_test_ballots,
        lastUpdated: resultsResponse.data.last_updated,
        recentActivity: [],
        geoDistribution: {},
        timeDistribution: {},
      };
      
      setAnalytics(analytics);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };
  
  // Poll settings handlers
  const handleEditToggle = () => {
    if (editMode) {
      // Reset to original poll data - ensure date remains as dayjs object
      setEditedPoll({
        ...poll,
        closing_datetime: poll.closing_datetime ? dayjs(poll.closing_datetime) : null
      });
    }
    setEditMode(!editMode);
  };
  
  const handlePollChange = (updates) => {
    // Handle poll type change
    if ('is_private' in updates) {
      // Reset voter emails when switching to public
      if (!updates.is_private) {
        setVoterEmails([]);
        setEmailTokens({});
      }
      // Update settings based on poll type
      if (!updates.is_private) {
        updates.settings = {
          ...editedPoll.settings,
          allow_write_in: false, // Reset write-in for public polls
          results_visibility: 'public'
        };
      }
    }
    
    // Ensure closing_datetime remains a dayjs object if provided
    if (updates.closing_datetime !== undefined) {
      if (updates.closing_datetime && !dayjs.isDayjs(updates.closing_datetime)) {
        updates.closing_datetime = dayjs(updates.closing_datetime);
      }
    }
    setEditedPoll({ ...editedPoll, ...updates });
  };
  
  const handleImageUpload = async (index, file) => {
    try {
      setUploadingImages(prev => ({ ...prev, [index]: true }));
      
      const serverImageUrl = await uploadImage(file);
      
      const newOptions = [...editedPoll.options];
      newOptions[index] = {
        ...newOptions[index],
        image_url: serverImageUrl
      };
      setEditedPoll(prev => ({
        ...prev,
        options: newOptions
      }));
    } catch (error) {
      setError(error.message);
    } finally {
      setUploadingImages(prev => ({ ...prev, [index]: false }));
    }
  };
  
  const handleImageRemove = (index) => {
    const newOptions = [...editedPoll.options];
    newOptions[index] = {
      ...newOptions[index],
      image_url: null
    };
    setEditedPoll(prev => ({
      ...prev,
      options: newOptions
    }));
  };
  
  const handleSavePoll = async () => {
    setSaving(true);
    setError('');
    
    try {
      const validOptions = editedPoll.options.filter(opt => opt.name && opt.name.trim());
      if (validOptions.length < 2) {
        setError('At least 2 options with names are required');
        setSaving(false);
        return;
      }
      
      const optionNames = validOptions.map(opt => opt.name.trim().toLowerCase());
      const uniqueNames = new Set(optionNames);
      if (uniqueNames.size !== optionNames.length) {
        setError('Option names must be unique');
        setSaving(false);
        return;
      }
      
      const updateData = {
        title: editedPoll.title,
        description: editedPoll.description,
        closing_datetime: editedPoll.closing_datetime 
          ? (dayjs.isDayjs(editedPoll.closing_datetime) 
              ? editedPoll.closing_datetime.toISOString() 
              : editedPoll.closing_datetime)
          : null,
        is_completed: editedPoll.is_completed,
        is_private: editedPoll.is_private,
        voter_emails: editedPoll.is_private ? voterEmails : [],
        tags: editedPoll.tags,
        options: validOptions.map(opt => ({
          id: opt.id.startsWith('temp-') ? null : opt.id,
          name: opt.name.trim(),
          description: opt.description,
          image_url: opt.image_url
        })),
        settings: editedPoll.settings
      };
      
      await API.put(`/polls/${pollId}`, updateData);
      
      logAdminAction('UPDATE_POLL', 'Poll settings and options updated');
      
      await loadPollData();
      
      setSuccess('Poll updated successfully');
      setEditMode(false);
    } catch (err) {
      setError('Failed to update poll: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };
  
  // Delete handlers
  const handleDeletePoll = async () => {
    try {
      await API.delete(`/polls/${pollId}`);
      
      logAdminAction('DELETE_POLL', 'Poll permanently deleted');
      
      setSuccess('Poll deleted successfully');
      setDeletePollDialog(false);
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError('Failed to delete poll: ' + (err.response?.data?.detail || err.message));
    }
  };
  
  const handleDeleteAllBallots = async () => {
    try {
      const authData = { poll_id: pollId };
      
      if (adminSession?.authMethod === 'token' && adminSession?.adminToken) {
        authData.admin_token = adminSession.adminToken;
      } else {
        const urlParams = new URLSearchParams(location.search);
        const tokenFromUrl = urlParams.get('token');
        if (tokenFromUrl) {
          authData.admin_token = tokenFromUrl;
        } else {
          setError('No authentication credentials available');
          return;
        }
      }
      
      const response = await API.delete(`/ballots/poll/${pollId}/all`, {
        data: authData
      });
      
      setSuccess(`Successfully deleted ${response.data.deleted_count} ballots`);
      setDeleteBallotsDialog(false);
      
      logAdminAction('DELETE_ALL_BALLOTS', 'All ballots deleted from poll');
      
      await loadPollData();
      await loadAnalytics();
    } catch (err) {
      setError('Failed to delete ballots: ' + (err.response?.data?.detail || err.message));
    }
  };

  const getAuthData = () => {
    const authData = { poll_id: pollId };
    
    if (adminSession?.authMethod === 'token' && adminSession?.adminToken) {
      authData.admin_token = adminSession.adminToken;
    } else {
      const urlParams = new URLSearchParams(location.search);
      const tokenFromUrl = urlParams.get('token');
      if (tokenFromUrl) {
        authData.admin_token = tokenFromUrl;
      }
    }
    
    return authData;
  };
console.log('Auth states:', { isAuthenticated, authDialog, loading });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ mt: '134.195px', minHeight: '100vh' }}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          {/* Authentication Dialog */}
            {(authDialog && !isAuthenticated) && (
              <AuthDialog
                open={true}
                onClose={() => navigate(`/vote/${pollId}`)}
                onAuthenticate={handleAuthenticate}
                error={authError}
              />
            )}
                      
          {isAuthenticated ? (
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              {/* Header */}
              <AdminHeader
                poll={poll}
                onNavigate={navigate}
                onLogout={handleLogout}
                onDeletePoll={() => setDeletePollDialog(true)}
                onDeleteBallots={() => setDeleteBallotsDialog(true)}
                analytics={analytics}
              />
              
              {/* Success/Error Messages */}
              <Snackbar
                open={!!success}
                autoHideDuration={6000}
                onClose={() => setSuccess('')}
              >
                <Alert severity="success" onClose={() => setSuccess('')}>
                  {success}
                </Alert>
              </Snackbar>
              
              <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError('')}
              >
                <Alert severity="error" onClose={() => setError('')}>
                  {error}
                </Alert>
              </Snackbar>
              
              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={activeTab} 
                  onChange={(e, v) => setActiveTab(v)}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  sx={{
                    '& .MuiTab-root': {
                      minHeight: { xs: 48, sm: 64 },
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    },
                    '& .MuiSvgIcon-root': {
                      fontSize: { xs: '1.2rem', sm: '1.5rem' },
                    }
                  }}
                >
                  <Tab icon={<SettingsIcon />} label="Poll Settings" iconPosition="start" />
                  <Tab icon={<ChartIcon />} label="Analytics" iconPosition="start" />
                  <Tab icon={<UploadIcon />} label="Bulk Import" iconPosition="start" />
                  <Tab icon={<HistoryIcon />} label="Audit Log" iconPosition="start" />
                </Tabs>
              </Box>
              
              {/* Tab Panels */}
              <TabPanel value={activeTab} index={0}>
                {poll && editedPoll && dataReady ? (
                  <AdminSettingsTab
                    poll={poll}
                    editedPoll={editedPoll}
                    editMode={editMode}
                    saving={saving}
                    analytics={analytics}
                    uploadingImages={uploadingImages}
                    voterEmails={voterEmails}
                    emailTokens={emailTokens}
                    regeneratingToken={regeneratingToken}
                    onEditToggle={handleEditToggle}
                    onPollChange={handlePollChange}
                    onImageUpload={handleImageUpload}
                    onImageRemove={handleImageRemove}
                    onSave={handleSavePoll}
                    onDeletePoll={() => setDeletePollDialog(true)}
                    onDeleteBallots={() => setDeleteBallotsDialog(true)}
                    onUpdateVoterEmails={updateVoterEmails}
                    onRegenerateToken={regenerateVoterToken}
                  />
                ) : (
                  <Box textAlign="center" py={4}>
                    <CircularProgress />
                    <Typography variant="body2" color="text.secondary" mt={2}>
                      Loading poll settings...
                    </Typography>
                  </Box>
                )}
              </TabPanel>
              
              <TabPanel value={activeTab} index={1}>
                <AdminAnalyticsTab
                  analytics={analytics}
                  poll={poll}
                  onRefresh={loadAnalytics}
                />
              </TabPanel>
              
              <TabPanel value={activeTab} index={2}>
                <AdminBulkImportTab
                  poll={poll}
                  onImportComplete={loadAnalytics}
                  onError={setError}
                  logAdminAction={logAdminAction}
                  getAuthData={getAuthData}
                />
              </TabPanel>
              
              <TabPanel value={activeTab} index={3}>
                <AdminAuditLogTab
                  auditLogs={auditLogs}
                  loading={loadingAudit}
                  onRefresh={loadAuditLogs}
                />
              </TabPanel>
            </Paper>
          ) : (
            <Box textAlign="center" py={8}>
              <CircularProgress />
              <Typography variant="body1" color="text.secondary" mt={2}>
                Authenticating...
              </Typography>
            </Box>
          )}
          
          {/* Delete Poll Confirmation Dialog */}
          <Dialog
            open={deletePollDialog}
            onClose={() => setDeletePollDialog(false)}
            maxWidth="sm"
            fullWidth
            fullScreen={fullScreenDialogs}
          >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
              <WarningIcon sx={{ mr: 1, color: 'error.main' }} />
              Delete Poll?
            </DialogTitle>
            <DialogContent>
              <Alert severity="error" sx={{ mb: 2 }}>
                This action cannot be undone!
              </Alert>
              <Typography>
                Are you sure you want to permanently delete this poll?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                • Poll: {poll?.title}<br />
                • Total votes: {poll?.vote_count || 0}<br />
                • All associated data will be lost
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeletePollDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleDeletePoll}
                color="error"
                variant="contained"
                startIcon={<DeleteForeverIcon />}
              >
                Delete Poll
              </Button>
            </DialogActions>
          </Dialog>
          
          {/* Delete Ballots Confirmation Dialog */}
          <Dialog
            open={deleteBallotsDialog}
            onClose={() => setDeleteBallotsDialog(false)}
            maxWidth="sm"
            fullWidth
            fullScreen={fullScreenDialogs}
          >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
              <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
              Clear All Ballots?
            </DialogTitle>
            <DialogContent>
              <Alert severity="warning" sx={{ mb: 2 }}>
                This will delete all votes for this poll!
              </Alert>
              <Typography>
                Are you sure you want to delete all ballots for this poll?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                • {analytics?.totalVotes || 0} regular votes will be deleted<br />
                • {analytics?.testVotes || 0} test votes will be deleted<br />
                • The poll will remain active
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteBallotsDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAllBallots}
                color="warning"
                variant="contained"
                startIcon={<ClearAllIcon />}
              >
                Clear All Ballots
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default Admin;