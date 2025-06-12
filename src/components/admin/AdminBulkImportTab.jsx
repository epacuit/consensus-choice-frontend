import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  FileUpload as FileUploadIcon,
  ContentPaste as PasteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import Papa from 'papaparse';
import API from '../../services/api';

/**
 * AdminBulkImportTab Component
 * 
 * Handles bulk import of ballots via CSV
 */
const AdminBulkImportTab = ({
  poll,
  onImportComplete,
  onError,
  logAdminAction,
  getAuthData,
}) => {
  const [importDialog, setImportDialog] = useState(false);
  const [importMethod, setImportMethod] = useState('csv');
  const [importData, setImportData] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importing, setImporting] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);

  const validateCandidateNames = (csvCandidates, pollCandidates) => {
    const errors = [];
    const pollNames = pollCandidates.map(opt => opt.name.toLowerCase());
    const csvNamesLower = csvCandidates.map(name => name.toLowerCase());
    
    // Check for CSV candidates not in poll
    csvCandidates.forEach((csvCandidate, index) => {
      if (!pollNames.includes(csvCandidate.toLowerCase())) {
        errors.push({
          type: 'missing_in_poll',
          message: `CSV candidate "${csvCandidate}" not found in poll options`,
          candidate: csvCandidate
        });
      }
    });
    
    // Check for poll candidates not in CSV
    pollCandidates.forEach(pollOption => {
      if (!csvNamesLower.includes(pollOption.name.toLowerCase())) {
        errors.push({
          type: 'missing_in_csv',
          message: `Poll option "${pollOption.name}" not found in CSV headers`,
          candidate: pollOption.name
        });
      }
    });
    
    return errors;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImportFile(file);
      setValidationErrors([]);
      
      Papa.parse(file, {
        complete: (results) => {
          if (results.data && results.data.length > 1) {
            const headers = results.data[0];
            const rows = results.data.slice(1).filter(row => row.length > 1);
            
            const candidateNames = headers.slice(1).filter(h => h && h.trim());
            
            // Validate candidate names
            const errors = validateCandidateNames(candidateNames, poll.options);
            setValidationErrors(errors);
            
            let totalBallots = 0;
            let uniqueRankings = 0;
            rows.forEach(row => {
              const voterCount = row[0] ? parseInt(row[0]) : 1;
              if (!isNaN(voterCount) && voterCount > 0) {
                totalBallots += voterCount;
                uniqueRankings++;
              }
            });
            
            const preview = {
              candidateNames,
              ballotCount: totalBallots,
              uniqueRankings: uniqueRankings,
              sampleRows: rows.slice(0, 5),
              hasErrors: errors.length > 0
            };
            
            setParsedData(preview);
            setImportData(results.data.map(row => row.join(',')).join('\n'));
          }
        },
        error: (error) => {
          onError('Failed to parse CSV file');
        }
      });
    }
  };
  
  const handleImportOpen = (method = 'csv') => {
    setImportMethod(method);
    setImportDialog(true);
    setOverwriteExisting(false);
    setConfirmOverwrite(false);
    setValidationErrors([]);
  };
  
  const handleImportClose = () => {
    setImportDialog(false);
    setImporting(false);
    setParsedData(null);
    setImportData('');
    setImportFile(null);
    setImportProgress(0);
    setOverwriteExisting(false);
    setConfirmOverwrite(false);
    setValidationErrors([]);
  };

  const handleBulkImport = async () => {
    // If overwrite is selected and not yet confirmed, show confirmation
    if (overwriteExisting && !confirmOverwrite) {
      setConfirmOverwrite(true);
      return;
    }
    
    setImporting(true);
    
    try {
      const lines = importData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const candidateNames = headers.slice(1).filter(h => h);
      
      // Final validation before import
      const errors = validateCandidateNames(candidateNames, poll.options);
      if (errors.length > 0) {
        throw new Error('Candidate name mismatch. Please fix the CSV headers to match poll options.');
      }
      
      const nameToOptionId = {};
      poll.options.forEach(option => {
        const matchingCandidate = candidateNames.find(
          c => c.toLowerCase() === option.name.toLowerCase()
        );
        if (matchingCandidate) {
          nameToOptionId[matchingCandidate] = option.id;
        } else if (candidateNames.includes(option.name)) {
          nameToOptionId[option.name] = option.id;
        }
      });
      
      const ballots = [];
      let totalVoterCount = 0;
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length <= 1) continue;
        
        const voterCount = values[0] ? parseInt(values[0]) : 1;
        if (isNaN(voterCount) || voterCount <= 0) continue;
        
        const rankings = [];
        
        candidateNames.forEach((candidateName, index) => {
          const rankValue = values[index + 1];
          if (rankValue && !isNaN(rankValue) && parseInt(rankValue) > 0) {
            rankings.push({
              option_id: nameToOptionId[candidateName],
              rank: parseInt(rankValue)
            });
          }
        });
        
        if (rankings.length > 0) {
          for (let j = 0; j < voterCount; j++) {
            ballots.push({
              poll_id: poll.id,
              rankings: rankings,
              test_mode_key: 'admin_import'
            });
          }
          totalVoterCount += voterCount;
        }
        
        // Update progress
        setImportProgress((i / lines.length) * 100);
      }
      
      if (ballots.length === 0) {
        throw new Error('No valid ballots found in CSV');
      }
      
      const authData = getAuthData();
      const requestData = {
        ...authData,
        ballots: ballots,
        overwrite_existing: overwriteExisting
      };
      
      const response = await API.post('/ballots/bulk-import', requestData);
      
      logAdminAction('BULK_IMPORT', `Imported ${response.data.imported_count} ballots from ${totalVoterCount} voters${overwriteExisting ? ' (overwrote existing)' : ''}`, {
        method: importMethod,
        count: response.data.imported_count,
        totalVoters: totalVoterCount,
        filename: importFile?.name,
        overwrite: overwriteExisting
      });
      
      handleImportClose();
      onImportComplete();
      
    } catch (err) {
      console.error('Bulk import error:', err);
      onError('Failed to import ballots: ' + (err.response?.data?.detail || err.message));
    } finally {
      setImporting(false);
      setConfirmOverwrite(false);
    }
  };

  const handlePasteDataChange = (e) => {
    setImportData(e.target.value);
    setValidationErrors([]);
    
    if (e.target.value.trim()) {
      const lines = e.target.value.trim().split('\n');
      if (lines.length > 1) {
        const headers = lines[0].split(',').map(h => h.trim());
        const candidateNames = headers.slice(1).filter(h => h);
        const rows = lines.slice(1).filter(line => line.split(',').length > 1);
        
        // Validate candidate names
        const errors = validateCandidateNames(candidateNames, poll.options);
        setValidationErrors(errors);
        
        let totalBallots = 0;
        let uniqueRankings = 0;
        rows.forEach(line => {
          const values = line.split(',');
          const voterCount = values[0] ? parseInt(values[0]) : 1;
          if (!isNaN(voterCount) && voterCount > 0) {
            totalBallots += voterCount;
            uniqueRankings++;
          }
        });
        
        setParsedData({
          candidateNames,
          ballotCount: totalBallots,
          uniqueRankings: uniqueRankings,
          hasErrors: errors.length > 0
        });
      }
    } else {
      setParsedData(null);
    }
  };

  const canImport = () => {
    if (importing) return false;
    if (importMethod === 'csv' && !importFile) return false;
    if (importMethod === 'paste' && !importData.trim()) return false;
    if (validationErrors.length > 0) return false;
    return true;
  };

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Bulk Import Ballots
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Import multiple ballots at once using CSV format.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              border: '2px solid',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover'
              }
            }}
            onClick={() => handleImportOpen('csv')}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <FileUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                CSV Upload
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload a CSV file with voter rankings
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              border: '2px solid',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover'
              }
            }}
            onClick={() => handleImportOpen('paste')}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <PasteIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Copy & Paste
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Paste CSV data directly
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Import Instructions */}
      <Box mt={4}>
        <Alert severity="info">
          <Typography variant="subtitle2" gutterBottom>
            CSV Format Requirements:
          </Typography>
          <Typography variant="body2" component="div">
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>First row should contain headers: (ignored), {poll?.options?.map(o => o.name).join(', ') || 'candidate names'}</li>
              <li>Each subsequent row represents a unique ranking pattern</li>
              <li>First column: number of voters who submitted this ranking (blank = 1)</li>
              <li>Values should be rankings (1 = first choice, 2 = second choice, etc.)</li>
              <li>Leave cells empty for unranked options</li>
              <li><strong>Headers must exactly match poll option names (case-insensitive)</strong></li>
            </ul>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Example:<br />
            5,1,2,3 (5 voters ranked A as 1st choice, B as 2nd, C as 3rd)<br />
            ,2,1,3 (1 voter ranked A as 2nd choice, B as 1st, C as 3rd)
          </Typography>
        </Alert>
      </Box>
      
      {/* Import Dialog */}
      <Dialog
        open={importDialog}
        onClose={handleImportClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Import Ballots - {importMethod === 'csv' ? 'CSV Upload' : 'Copy & Paste'}
        </DialogTitle>
        <DialogContent>
          {importMethod === 'csv' && (
            <Box>
              <input
                accept=".csv"
                style={{ display: 'none' }}
                id="csv-file-upload"
                type="file"
                onChange={handleFileUpload}
              />
              <label htmlFor="csv-file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<FileUploadIcon />}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Select CSV File
                </Button>
              </label>
              {importFile && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Selected: {importFile.name}
                </Alert>
              )}
              {parsedData && !parsedData.hasErrors && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>File Preview:</strong><br />
                    Candidates: {parsedData.candidateNames.join(', ')}<br />
                    Total ballots: {parsedData.ballotCount}<br />
                    Unique rankings: {parsedData.uniqueRankings}
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
          
          {importMethod === 'paste' && (
            <Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Paste CSV data below. First row should be headers. First column is the number of voters with that ranking.
              </Typography>
              <TextField
                multiline
                rows={10}
                fullWidth
                variant="outlined"
                placeholder={`Count,${poll?.options?.map(o => o.name).join(',') || 'A,B,C'}\n5,1,2,3\n,2,1,3\n10,3,1,2`}
                value={importData}
                onChange={handlePasteDataChange}
              />
              {parsedData && !parsedData.hasErrors && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Data Preview:</strong><br />
                    Candidates: {parsedData.candidateNames.join(', ')}<br />
                    Total ballots: {parsedData.ballotCount}<br />
                    Unique rankings: {parsedData.uniqueRankings}
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
          
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Candidate Name Mismatches:
              </Typography>
              <List dense>
                {validationErrors.map((error, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <ErrorIcon color="error" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={error.message} />
                  </ListItem>
                ))}
              </List>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Please ensure CSV headers exactly match poll option names (case-insensitive).
              </Typography>
            </Alert>
          )}
          
          {/* Overwrite Option */}
          {!confirmOverwrite && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={overwriteExisting}
                    onChange={(e) => setOverwriteExisting(e.target.checked)}
                    color="warning"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">
                      Overwrite existing ballots
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Warning: This will delete all existing ballots before importing new ones
                    </Typography>
                  </Box>
                }
              />
            </Box>
          )}
          
          {/* Overwrite Confirmation */}
          {confirmOverwrite && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                <strong>Confirm Overwrite</strong>
              </Typography>
              <Typography variant="body2">
                This will permanently delete all existing ballots for this poll and replace them with the imported data.
                This action cannot be undone.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Are you sure you want to continue?
              </Typography>
            </Alert>
          )}
          
          {importing && (
            <Box mt={2}>
              <LinearProgress variant="determinate" value={importProgress} />
              <Typography variant="body2" color="text.secondary" align="center" mt={1}>
                {overwriteExisting ? 'Overwriting and importing...' : 'Importing...'} {Math.round(importProgress)}%
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleImportClose} disabled={importing}>
            Cancel
          </Button>
          {confirmOverwrite ? (
            <>
              <Button
                onClick={() => setConfirmOverwrite(false)}
                disabled={importing}
              >
                Back
              </Button>
              <Button
                onClick={handleBulkImport}
                variant="contained"
                color="error"
                disabled={!canImport()}
              >
                Confirm Overwrite & Import
              </Button>
            </>
          ) : (
            <Button
              onClick={handleBulkImport}
              variant="contained"
              disabled={!canImport()}
              color={overwriteExisting ? "warning" : "primary"}
            >
              {overwriteExisting ? 'Overwrite & Import' : 'Import Ballots'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminBulkImportTab;