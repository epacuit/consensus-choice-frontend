import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, Typography, Paper, Box } from '@mui/material';
import theme from './theme/theme';
import CreatePoll from './pages/CreatePoll';
import PollCreatedSuccess from './pages/PollCreatedSuccess';
import Vote from './pages/Vote'; 
import PollResults from './pages/PollResults';
import DevTools from './pages/DevTools';
import Admin from './pages/Admin';
import HomePage from './pages/Home';
import NavigationBar from './components/NavigationBar'; 
import About from './pages/About'; 
import Feedback from './pages/Feedback'; 
import TestWinnerExplanation from './pages/TestWinnerExplanation'; 


// Inside your App component's Router:
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <NavigationBar /> {/* Add this single line */}

        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePoll />} />
        <Route path="/poll-created" element={<PollCreatedSuccess />} />
          <Route path="/vote/:pollId" element={<Vote />} />
          <Route path="/about" element={<About />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/results/:pollId" element={<PollResults />} />
          <Route path="/admin/:pollId" element={<Admin />} />
          <Route path="/dev" element={<DevTools />} />
          <Route path="/testwinnerexplanation" element={<TestWinnerExplanation />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;