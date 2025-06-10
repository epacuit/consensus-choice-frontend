import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Collapse,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Info as InfoIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';

const PollDetails = ({ 
  poll, 
  defaultExpanded = false,
  showToggleButton = true,
  elevation = 0,
  sx = {} 
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!poll) return null;

  const hasDetails = poll.description || (poll.options && poll.options.length > 0);
  if (!hasDetails) return null;

  const content = (
    <Paper
      elevation={elevation}
      sx={{
        p: 3,
        backgroundColor: alpha(theme.palette.grey[50], 0.5),
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        ...sx,
      }}
    >
      {poll.description && (
        <Box mb={3}>
          <ReactMarkdown>{poll.description}</ReactMarkdown>
        </Box>
      )}
      
      {poll.options && poll.options.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: poll.description ? 2 : 0, mb: 2 }}>
            Candidates
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {poll.options.map((option) => (
              <Box key={option.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                {option.image_url ? (
                  <>
                    <Avatar 
                      src={option.image_url} 
                      alt={option.name}
                      sx={{ width: 56, height: 56, flexShrink: 0 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {option.name}
                      </Typography>
                      {option.description && (
                        <Box sx={{ 
                          mt: 0.5, 
                          color: 'text.secondary',
                          '& p': { margin: 0 },
                          '& p:not(:last-child)': { mb: 1 },
                          '& ul, & ol': { mt: 0.5, mb: 0.5, pl: 2 },
                          '& li': { mb: 0.25 },
                          '& strong': { color: theme.palette.text.primary },
                        }}>
                          <ReactMarkdown>{option.description}</ReactMarkdown>
                        </Box>
                      )}
                    </Box>
                  </>
                ) : (
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: option.description ? 'bold' : 'normal' }}>
                      {option.name}
                    </Typography>
                    {option.description && (
                      <Box sx={{ 
                        mt: 0.5, 
                        color: 'text.secondary',
                        '& p': { margin: 0 },
                        '& p:not(:last-child)': { mb: 1 },
                        '& ul, & ol': { mt: 0.5, mb: 0.5, pl: 2 },
                        '& li': { mb: 0.25 },
                        '& strong': { color: theme.palette.text.primary },
                      }}>
                        <ReactMarkdown>{option.description}</ReactMarkdown>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </>
      )}
    </Paper>
  );

  if (!showToggleButton) {
    return content;
  }

  return (
    <>
      <Button
        size="small"
        startIcon={<InfoIcon />}
        onClick={() => setExpanded(!expanded)}
        sx={{ 
          mb: 2,
          textTransform: 'none',
          color: expanded ? 'primary.main' : 'text.secondary',
        }}
      >
        {expanded ? 'Hide' : 'Show'} Details
      </Button>
      
      <Collapse in={expanded}>
        {content}
      </Collapse>
    </>
  );
};

export default PollDetails;