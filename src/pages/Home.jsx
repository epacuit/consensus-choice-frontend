import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  HowToVote as VoteIcon,
  CompareArrows as CompareIcon,
  EmojiEvents as WinnerIcon,
  Poll as PollIcon,
  ArrowForward as ArrowIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import betterChoicesIcon from '../assets/BC4D-wht.png';

const HomePage = () => {
  const navigate = useNavigate();
  
  // Demo polls data
  const demoPolls = [
    {
      title: "Alaska 2022 Special General Election",
      description: "Experience how ranked choice voting played out in a real election",
      link: "/results/alaska-2022",
    },
    {
      title: "Sample Election", 
      description: "Try a demonstration election to see how the system works",
      link: "/results/sample-election",
    },
    {
      title: "Pizza Toppings",
      description: "Join our ongoing poll to rank your favorite pizza toppings",
      pollId: "pizza-toppings",
      isLive: true,
    },
  ];

  return (
    <>
      {/* Title Section - Full Width */}
      <Box 
        sx={{
          textAlign: 'center',
          py: { xs: 12, md: 16 },
          minHeight: { xs: '400px', md: '500px' },
          display: 'flex',
          alignItems: 'center',
                            background: 'radial-gradient(ellipse 130% 130% at 0% 0%, #8a9abb 0%, #3a4a6c 30%, #142039 70%)',
          position: 'relative',
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="h1" 
            component="h1" 
            sx={{ 
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
              mb: 3,
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            Consensus Choice Voting
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              maxWidth: '500px',
              mx: 'auto',
              fontWeight: 400,
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.95)',
            }}
          >
            Find the candidate with the broadest support through head-to-head comparisons.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>

      {/* How It Works Section */}
      <Box sx={{ mb: 8 }}>
        <Typography 
          variant="h3" 
          component="h2" 
          align="center"
          sx={{ mb: 5 }}
        >
          How It Works
        </Typography>
        
        <List sx={{ maxWidth: '800px', mx: 'auto' }}>
          <ListItem alignItems="flex-start" sx={{ px: 0, py: 2 }}>
            <ListItemIcon sx={{ minWidth: 72, mt: 0.5 }}>
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                  color: 'white',
                }}
              >
                <VoteIcon sx={{ fontSize: 28 }} />
              </Box>
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="h6" component="div" gutterBottom>
                  Voters Rank Candidates
                </Typography>
              }
              secondary={
                <Typography variant="body1" color="text.secondary">
                  Each voter orders the candidates from their most preferred to least preferred
                </Typography>
              }
              sx={{ mt: 0 }}
            />
          </ListItem>
          
          <ListItem alignItems="flex-start" sx={{ px: 0, py: 2 }}>
            <ListItemIcon sx={{ minWidth: 72, mt: 0.5 }}>
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                  color: 'white',
                }}
              >
                <CompareIcon sx={{ fontSize: 28 }} />
              </Box>
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="h6" component="div" gutterBottom>
                  Head-to-Head Comparisons
                </Typography>
              }
              secondary={
                <Typography variant="body1" color="text.secondary">
                  Candidates are compared one-on-one based on the voters' preferences
                </Typography>
              }
              sx={{ mt: 0 }}
            />
          </ListItem>
          
          <ListItem alignItems="flex-start" sx={{ px: 0, py: 2 }}>
            <ListItemIcon sx={{ minWidth: 72, mt: 0.5 }}>
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                  color: 'white',
                }}
              >
                <WinnerIcon sx={{ fontSize: 28 }} />
              </Box>
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="h6" component="div" gutterBottom>
                  Consensus Winner
                </Typography>
              }
              secondary={
                <Typography variant="body1" color="text.secondary">
                  The candidate that beats every other candidate one-on-one is the winner
                </Typography>
              }
              sx={{ mt: 0 }}
            />
          </ListItem>
        </List>
      </Box>

      {/* Example Polls Section */}
      <Box mb={8}>
        <Typography 
          variant="h3" 
          component="h2" 
          align="center"
          sx={{ mb: 5 }}
        >
          Example Polls
        </Typography>
        
        <Grid container spacing={3} justifyContent="center">
          {demoPolls.map((poll, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%',
                  minHeight: '280px',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent sx={{ 
                  flexGrow: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  p: 3,
                }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <PollIcon sx={{ color: 'primary.main' }} />
                    {poll.isLive && (
                      <Chip
                        label="LIVE"
                        size="small"
                        sx={{
                          backgroundColor: 'error.light',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </Box>
                  
                  <Typography variant="h6" component="h3" gutterBottom>
                    {poll.title}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ mb: 3, flexGrow: 1 }}
                  >
                    {poll.description}
                  </Typography>
                  
                  <Box mt="auto">
                    {poll.isLive ? (
                      <Box display="flex" gap={1.5}>
                        <Button 
                          variant="contained"
                          fullWidth
                          onClick={() => navigate(`/vote/${poll.pollId}`)}
                          size="small"
                        >
                          Submit Vote
                        </Button>
                        <Button 
                          variant="outlined"
                          fullWidth
                          onClick={() => navigate(`/results/${poll.pollId}`)}
                          size="small"
                        >
                          View Results
                        </Button>
                      </Box>
                    ) : (
                      <Button 
                        variant="outlined"
                        fullWidth
                        href={poll.link}
                        endIcon={<ArrowIcon />}
                      >
                        View Results
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      {/* Create Your Own Section */}
      <Box 
        sx={{ 
          textAlign: 'center',
          pt: 6,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom>
          Ready to Create Your Own Poll?
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}
        >
          Set up a poll in minutes and find the consensus choice for your group
        </Typography>
        <Button 
          variant="contained" 
          size="large"
          onClick={() => navigate('/create')}
          sx={{ px: 4, py: 1.5, mb: 6 }}
        >
          Create a Poll
        </Button>

        {/* Multiple Ways to Vote */}
        <Typography 
          variant="h5" 
          component="h3" 
          sx={{ mb: 4 }}
        >
          Multiple Ways to Vote
        </Typography>
        
        <List sx={{ maxWidth: '800px', mx: 'auto', textAlign: 'left' }}>
          <ListItem alignItems="flex-start" sx={{ px: 0, py: 2 }}>
            <ListItemIcon sx={{ minWidth: 72, mt: 0.5 }}>
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                  color: 'white',
                }}
              >
                <PublicIcon sx={{ fontSize: 28 }} />
              </Box>
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="h6" component="div" gutterBottom>
                  Live Public Polls
                </Typography>
              }
              secondary={
                <Typography variant="body1" color="text.secondary">
                  Create a poll and share the link. Anyone can vote and see results in real-time.
                </Typography>
              }
              sx={{ mt: 0 }}
            />
          </ListItem>
          
          <ListItem alignItems="flex-start" sx={{ px: 0, py: 2 }}>
            <ListItemIcon sx={{ minWidth: 72, mt: 0.5 }}>
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                  color: 'white',
                }}
              >
                <LockIcon sx={{ fontSize: 28 }} />
              </Box>
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="h6" component="div" gutterBottom>
                  Private Secure Polls
                </Typography>
              }
              secondary={
                <Typography variant="body1" color="text.secondary">
                  Invite specific voters who receive personal voting links via email for secure elections.
                </Typography>
              }
              sx={{ mt: 0 }}
            />
          </ListItem>
          
          <ListItem alignItems="flex-start" sx={{ px: 0, py: 2 }}>
            <ListItemIcon sx={{ minWidth: 72, mt: 0.5 }}>
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                  color: 'white',
                }}
              >
                <UploadIcon sx={{ fontSize: 28 }} />
              </Box>
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="h6" component="div" gutterBottom>
                  Upload Your Data
                </Typography>
              }
              secondary={
                <Typography variant="body1" color="text.secondary">
                  Gather rankings yourself and upload as CSV or connect to Google Sheets for analysis.
                </Typography>
              }
              sx={{ mt: 0 }}
            />
          </ListItem>
        </List>
        
        <Box mt={4}>
          <Typography variant="body2" color="text.secondary">
            For more information about ranked choice voting, visit{' '}
            <Link href="https://betterchoices.vote" target="_blank" rel="noopener">
              betterchoices.vote
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
    </>
  );
};

export default HomePage;