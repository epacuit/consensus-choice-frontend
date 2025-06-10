import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Chip,
  Typography,
  Alert,
} from '@mui/material';
import {
  Email as EmailIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

/**
 * EmailListInput Component
 * 
 * Reusable component for managing email lists
 * Supports multiple email input, editing, and validation
 * Used in CreatePoll for private polls and Admin for managing voters
 */
const EmailListInput = ({
  emails = [],
  onChange,
  error = false,
  helperText = '',
  label = 'Email Addresses',
  placeholder = 'Enter email(s) - separate multiple with comma, space, or paste a list',
  required = false,
  disabled = false,
  showInfoIcon = true,
  inputRef,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editValue, setEditValue] = useState('');
  const [inputError, setInputError] = useState('');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateAndAddEmails = () => {
    const input = emailInput.trim();
    if (!input) {
      setInputError('');
      return;
    }

    // Split by comma, semicolon, space, or newline
    const potentialEmails = input.split(/[,;\s\n]+/).filter(e => e);
    
    const validEmails = [];
    const invalidEmails = [];
    
    potentialEmails.forEach(email => {
      const trimmed = email.trim().toLowerCase();
      if (trimmed) {
        if (emailRegex.test(trimmed)) {
          if (!emails.includes(trimmed)) {
            validEmails.push(trimmed);
          }
        } else {
          invalidEmails.push(email);
        }
      }
    });
    
    if (invalidEmails.length > 0) {
      setInputError(`Invalid email format: ${invalidEmails.join(', ')}`);
      // Don't clear input so user can fix it
    } else if (validEmails.length > 0) {
      onChange([...emails, ...validEmails]);
      setEmailInput('');
      setInputError('');
    } else {
      setInputError('All emails are already in the list');
    }
  };

  const removeEmail = (emailToRemove) => {
    onChange(emails.filter(email => email !== emailToRemove));
  };

  const startEdit = (index, email) => {
    setEditingIndex(index);
    setEditValue(email);
    setInputError('');
  };

  const saveEdit = () => {
    const trimmedEmail = editValue.trim().toLowerCase();
    
    if (!trimmedEmail) {
      cancelEdit();
      return;
    }
    
    if (!emailRegex.test(trimmedEmail)) {
      setInputError('Invalid email format');
      return;
    }
    
    // Check for duplicates (excluding the current index)
    const hasDuplicate = emails.some((email, idx) => 
      idx !== editingIndex && email === trimmedEmail
    );
    
    if (hasDuplicate) {
      setInputError('This email is already in the list');
      return;
    }
    
    // Update the email at the current index
    const newEmails = [...emails];
    newEmails[editingIndex] = trimmedEmail;
    onChange(newEmails);
    
    setEditingIndex(-1);
    setEditValue('');
    setInputError('');
  };

  const cancelEdit = () => {
    setEditingIndex(-1);
    setEditValue('');
    setInputError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      validateAndAddEmails();
    }
  };

  const handleEditKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {label}
        {showInfoIcon && (
          <InfoIcon sx={{ ml: 1, fontSize: 18, color: 'text.secondary' }} />
        )}
      </Typography>
      
      <Box display="flex" alignItems="flex-start" mb={2}>
        <Box flex={1} mr={1}>
          <TextField
            fullWidth
            size="small"
            placeholder={placeholder}
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value);
              setInputError(''); // Clear error when typing
            }}
            onKeyPress={handleKeyPress}
            error={error || !!inputError}
            disabled={disabled}
            inputRef={inputRef}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-error': {
                  '& fieldset': {
                    borderColor: 'error.main',
                    borderWidth: 2,
                  },
                },
              },
            }}
            InputProps={{
              startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          {inputError && (
            <Typography variant="caption" color="error" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <ErrorIcon sx={{ fontSize: 14, mr: 0.5 }} />
              {inputError}
            </Typography>
          )}
        </Box>
        <Button 
          onClick={validateAndAddEmails} 
          size="small" 
          variant="outlined"
          disabled={disabled}
        >
          Add
        </Button>
      </Box>
      
      <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
        {emails.map((email, index) => (
          editingIndex === index ? (
            <Box key={`edit-${index}`} display="flex" alignItems="center" gap={1}>
              <TextField
                size="small"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyPress={handleEditKeyPress}
                onBlur={saveEdit}
                error={!!inputError}
                autoFocus
                sx={{ width: 250 }}
              />
              <Button size="small" onClick={cancelEdit} color="inherit">
                Cancel
              </Button>
            </Box>
          ) : (
            <Chip
              key={email}
              label={email}
              onDelete={disabled ? undefined : () => removeEmail(email)}
              onClick={disabled ? undefined : () => startEdit(index, email)}
              size="small"
              color="primary"
              variant="outlined"
              disabled={disabled}
              sx={{ 
                cursor: disabled ? 'default' : 'pointer',
                '&:hover': disabled ? {} : {
                  backgroundColor: 'action.hover'
                }
              }}
            />
          )
        ))}
      </Box>
      
      <Typography variant="caption" color={error ? "error" : "text.secondary"}>
        {helperText || 
          (emails.length === 0 
            ? `No emails added yet${required ? ' - you must add at least one email address' : ''}`
            : `${emails.length} email${emails.length === 1 ? '' : 's'} added${disabled ? '' : ' (click to edit)'}`
          )
        }
      </Typography>
    </Box>
  );
};

export default EmailListInput;