import React, { useRef } from 'react';
import {
  Box,
  TextField,
} from '@mui/material';
import dayjs from 'dayjs';

// Import shared components
import PollBasicInfo from './PollBasicInfo';
import PollOptionsList from './PollOptionsList';
import VotingSettings from './VotingSettings';
import SettingSwitch from './SettingSwitch';
import PollDateTimePicker from './PollDateTimePicker';

/**
 * PollForm Component
 * 
 * Comprehensive form for creating/editing polls
 * Handles all poll data and provides callbacks for updates
 */
const PollForm = ({
  poll,
  onChange,
  onImageUpload,
  onImageRemove,
  isEditing = false,
  canModifyOptions = true,
  errors = {},
  uploadingImages = {},
  isPrivatePoll = false,
  showCompletedToggle = false,
  refs = { current: {} },
}) => {
  // Add this null check at the very beginning
  if (!poll) {
    return <Box>Loading...</Box>;
  }

  // Ensure closing_datetime is always a dayjs object or null
  const normalizedPoll = {
    ...poll,
    closing_datetime: poll.closing_datetime 
      ? (dayjs.isDayjs(poll.closing_datetime) ? poll.closing_datetime : dayjs(poll.closing_datetime))
      : null
  };

  // Handle changes to basic info
  const handleBasicInfoChange = (field, value) => {
    onChange({ [field]: value });
  };

  // Handle changes to settings
  const handleSettingsChange = (field, value) => {
    onChange({
      settings: {
        ...normalizedPoll.settings,
        [field]: value
      }
    });
  };

  // Handle option changes
  const handleOptionChange = (index, field, value) => {
    const newOptions = [...normalizedPoll.options];
    newOptions[index] = {
      ...newOptions[index],
      [field]: value
    };
    onChange({ options: newOptions });
  };

  // Handle adding option
  const handleAddOption = () => {
    const newOption = {
      id: `temp-${Date.now()}`,
      name: '',
      description: null,
      image_url: null
    };
    onChange({ options: [...normalizedPoll.options, newOption] });
  };

  // Handle removing option
  const handleRemoveOption = (index) => {
    // Only check total number of option blocks, not their content
    if (normalizedPoll.options.length <= 2) {
        return; // Must keep at least 2 option blocks
    }
    
    onChange({ options: normalizedPoll.options.filter((_, i) => i !== index) });
  };

  // Handle image upload for options
  const handleImageUpload = async (index, file) => {
    if (onImageUpload) {
      await onImageUpload(index, file);
    }
  };

  // Handle image removal for options
  const handleImageRemove = (index) => {
    if (onImageRemove) {
      onImageRemove(index);
    }
  };

  return (
    <Box>
      {/* Basic Information */}
      <Box sx={{ mb: 4 }}>
        <PollBasicInfo
          poll={normalizedPoll}
          onChange={handleBasicInfoChange}
          disabled={!isEditing}
          showCompletedToggle={showCompletedToggle}
          errors={errors}
          refs={refs}
        />
      </Box>

      {/* Voting Settings - only show in column layout for admin */}
      {showCompletedToggle && (
        <Box sx={{ mb: 4 }}>
          <VotingSettings
            settings={normalizedPoll?.settings || {}}
            onSettingChange={handleSettingsChange}
            isPrivatePoll={isPrivatePoll}
            disabled={!isEditing}
          />
        </Box>
      )}

      {/* Poll Options */}
      <Box sx={{ mb: 4 }}>
        <PollOptionsList
          options={normalizedPoll.options || []}
          isEditing={isEditing}
          onOptionChange={handleOptionChange}
          onOptionAdd={handleAddOption}
          onOptionRemove={handleRemoveOption}
          onImageUpload={handleImageUpload}
          onImageRemove={handleImageRemove}
          uploadingImages={uploadingImages}
          fieldErrors={errors}
          errorRefs={refs}   
          canModifyOptions={canModifyOptions}
          showAddButton={canModifyOptions}
        />
      </Box>

      {/* Voting Settings - show inline for create poll */}
      {!showCompletedToggle && (
        <Box sx={{ mb: 4 }}>
          <VotingSettings
            settings={normalizedPoll?.settings || {}}
            onSettingChange={handleSettingsChange}
            isPrivatePoll={isPrivatePoll}
            disabled={!isEditing}
          />
          
          {/* Closing Date */}
          <Box mt={3}>
            <PollDateTimePicker
              value={normalizedPoll?.closing_datetime}
              onChange={(newValue) => {
                onChange({ 
                  closing_datetime: newValue,
                  settings: {
                    ...normalizedPoll.settings,
                    // Reset can_view_before_close if no closing date
                    can_view_before_close: !!newValue ? normalizedPoll.settings.can_view_before_close : false
                  }
                });
              }}
              disabled={!isEditing}
            />
          </Box>

          {/* Show live results option - only if closing date is set */}
          {normalizedPoll?.closing_datetime && (
            <Box mt={2}>
              <SettingSwitch
                checked={normalizedPoll.settings?.can_view_before_close || false}
                onChange={(e) => handleSettingsChange('can_view_before_close', e.target.checked)}
                label="Show live results before poll closes"
                disabled={!isEditing}
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default PollForm;