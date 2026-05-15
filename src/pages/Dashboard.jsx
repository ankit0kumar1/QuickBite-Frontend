// src/pages/Dashboard.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, Paper, Chip } from '@mui/material';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome, {user?.fullName}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Email: {user?.email}
        </Typography>
        <Chip
          label={user?.role}
          color="error"
          sx={{ mt: 2 }}
        />
      </Paper>
    </Box>
  );
};

export default Dashboard;