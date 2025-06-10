import React from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
} from '@mui/material';
import {
  Delete as DeleteIcon,
} from '@mui/icons-material';
import ImageUploadButton from './ImageUploadButton';

/**
 * PollOptionCard Component
 * 
 * Displays a poll option/candidate with image, name, and description
 * Can be used in both edit mode (with inputs) and display mode
 */
const PollOptionCard = ({
  option,
  index,
  isEditing = false,
  onNameChange,
  onDescriptionChange,
  onImageUpload,
  onImageRemove,
  onDelete,
  canDelete = true,
  isUploading = false,
  hasError = false,
  inputRef,
}) => {
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: 'grey.50',
        borderRadius: 2,
        border: hasError ? '2px solid' : 'none',
        borderColor: hasError ? 'error.main' : 'transparent',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: isEditing ? 'grey.100' : 'grey.50',
        }
      }}
    >
      <Box display="flex" gap={2}>
        {/* Image Upload */}
        <ImageUploadButton
          id={`option-image-${index}`}
          imageUrl={option.image_url}
          onUpload={onImageUpload}
          onRemove={isEditing ? onImageRemove : null}
          isUploading={isUploading}
          disabled={!isEditing}
          size={80}
        />

        {/* Option Details */}
        <Box flex={1}>
          {isEditing ? (
            <>
          <TextField
            fullWidth
            label={`Option ${index + 1} Name`}
            value={option.name || ''}
            onChange={(e) => onNameChange(e.target.value)}
            required
            size="small"
            error={hasError}
            helperText={
              hasError 
                ? option.name.trim() === '' 
                  ? 'Option name is required' 
                  : 'This name is already used by another option'
                : ''
            }
            inputRef={inputRef}
            sx={{
              mb: 1,
              '& .MuiOutlinedInput-root': {
                '&.Mui-error': {
                  '& fieldset': {
                    borderColor: 'error.main',
                    borderWidth: 2,
                  },
                },
              },
            }}
          />
              <TextField
                fullWidth
                label="Description (Optional)"
                value={option.description || ''}
                onChange={(e) => onDescriptionChange(e.target.value)}
                size="small"
                multiline
                rows={2}
                placeholder="Brief description of this option..."
              />
            </>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                {index + 1}. {option.name}
              </Typography>
              {option.description && (
                <Typography variant="body2" color="text.secondary">
                  {option.description}
                </Typography>
              )}
            </>
          )}
        </Box>

        {/* Delete Button */}
        {isEditing && onDelete && (
          <Box display="flex" alignItems="center">
            <IconButton
              onClick={onDelete}
              disabled={!canDelete}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PollOptionCard;