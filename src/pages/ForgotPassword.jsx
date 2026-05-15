import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import authApi from '../api/authApi';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    minHeight: 56,
    borderRadius: 2.5,
    backgroundColor: '#fbfcff',
  },
};

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      setMessage(res.data?.message || 'If an account exists, a reset link has been sent to your email.');
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Password reset is blocked by the API Gateway. Restart api-gateway so /auth/forgot-password is public.');
        return;
      }
      setError(err.response?.data?.message || 'Could not create reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 76px)', display: 'flex', alignItems: 'center', py: 6, background: 'linear-gradient(180deg, rgba(255,247,242,0.72) 0%, rgba(248,249,252,1) 42%)' }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ maxWidth: 520, mx: 'auto', p: { xs: 3, sm: 4.5 }, borderRadius: 4, border: '1px solid rgba(229,57,53,0.1)', boxShadow: '0 24px 80px rgba(22,24,35,0.12)' }}>
          <Stack spacing={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ width: 58, height: 58, mx: 'auto', mb: 1.5, display: 'grid', placeItems: 'center', borderRadius: '18px', color: '#d32f2f', background: 'linear-gradient(135deg, #fff1ed 0%, #fff8e5 100%)' }}>
                <MarkEmailReadOutlinedIcon fontSize="large" />
              </Box>
              <Typography variant="h4" fontWeight={900}>Forgot Password</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                Enter your email and we will generate a secure reset link.
              </Typography>
            </Box>

            {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
            {message && <Alert severity="success">{message}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.25}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button type="submit" fullWidth variant="contained" color="error" size="large" disabled={loading} sx={{ minHeight: 54, borderRadius: 2.5, fontWeight: 900 }}>
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
                </Button>
                <Typography align="center" variant="body2" color="text.secondary">
                  Remembered it? <Link to="/login" style={{ color: '#d32f2f', fontWeight: 800, textDecoration: 'none' }}>Back to login</Link>
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
