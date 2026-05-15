import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PasswordOutlinedIcon from '@mui/icons-material/PasswordOutlined';
import authApi from '../api/authApi';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    minHeight: 56,
    borderRadius: 2.5,
    backgroundColor: '#fbfcff',
  },
};

const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const validate = () => {
    if (!token) return 'Reset token is missing or invalid';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain one uppercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain one number';
    if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain one special character';
    if (password !== confirm) return 'Passwords do not match';
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Password reset is blocked by the API Gateway. Restart api-gateway so /auth/reset-password is public.');
        return;
      }
      setError(err.response?.data?.message || 'Reset link is invalid or expired');
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
                <PasswordOutlinedIcon fontSize="large" />
              </Box>
              <Typography variant="h4" fontWeight={900}>Reset Password</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                Choose a new password for your QuickBite account.
              </Typography>
            </Box>

            {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
            {done && <Alert severity="success">Password reset successfully. Redirecting to login...</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.25}>
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button type="submit" fullWidth variant="contained" color="error" size="large" disabled={loading || done} sx={{ minHeight: 54, borderRadius: 2.5, fontWeight: 900 }}>
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                </Button>
                <Typography align="center" variant="body2" color="text.secondary">
                  <Link to="/login" style={{ color: '#d32f2f', fontWeight: 800, textDecoration: 'none' }}>Back to login</Link>
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default ResetPassword;
