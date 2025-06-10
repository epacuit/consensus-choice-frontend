import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import SettingSwitch from './SettingSwitch';

/**
 * VotingSettings Component
 * 
 * Displays all voting-related settings for a poll
 * Used in both CreatePoll and Admin components
 */
const VotingSettings = ({
  settings,
  onSettingChange,
  isPrivatePoll = false,
  disabled = false,
}) => {
  const handleChange = (field, value) => {
    if (onSettingChange) {
      onSettingChange(field, value);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Voting Settings
      </Typography>
      
      <Box display="flex" flexDirection="column" gap={1}>
        {/* Allow write-in options - only for public polls */}
        {!isPrivatePoll && (
          <SettingSwitch
            checked={settings.allow_write_in || false}
            onChange={(e) => handleChange('allow_write_in', e.target.checked)}
            label="Allow write-in options"
            description="Voters can add new options and update their ballots"
            disabled={disabled}
          />
        )}

        <SettingSwitch
          checked={settings.allow_ties || false}
          onChange={(e) => handleChange('allow_ties', e.target.checked)}
          label="Allow voters to rank options equally (ties)"
          disabled={disabled}
        />

        <SettingSwitch
          checked={settings.require_complete_ranking || false}
          onChange={(e) => handleChange('require_complete_ranking', e.target.checked)}
          label="Require voters to rank all options"
          disabled={disabled}
        />

        <SettingSwitch
          checked={settings.randomize_options || false}
          onChange={(e) => handleChange('randomize_options', e.target.checked)}
          label="Randomize option order for each voter"
          disabled={disabled}
        />


        {/* Results Visibility - only for private polls */}
        {isPrivatePoll && (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Results Visibility</InputLabel>
            <Select
              value={settings.results_visibility || 'public'}
              label="Results Visibility"
              onChange={(e) => handleChange('results_visibility', e.target.value)}
              disabled={disabled}
              startAdornment={<VisibilityIcon sx={{ mr: 1, color: 'text.secondary' }} />}
            >
              <MenuItem value="public">Public - Anyone can see the results</MenuItem>
              <MenuItem value="voters">Voters Only - Only people who voted can see the results</MenuItem>
              <MenuItem value="creator">Creator Only - Only you can see the results</MenuItem>
            </Select>
          </FormControl>
        )}
      </Box>
    </Box>
  );
};

export default VotingSettings;