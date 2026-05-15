// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleHomePath } from '../utils/roleRoutes';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const OAUTH_BASE_URL = (
  process.env.REACT_APP_OAUTH_BASE_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  'http://localhost:8080'
).replace(/\/api\/v1\/?$/, '');

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    minHeight: 56,
    borderRadius: 2.5,
    backgroundColor: '#fbfcff',
  },
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!formData.email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errs.email = 'Enter a valid email address';
    if (!formData.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const loggedInUser = await login(formData);
      navigate(getRoleHomePath(loggedInUser?.role), { replace: true });
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${OAUTH_BASE_URL}/oauth2/authorization/google`;
  };

  return (
    <Box
      sx={{
        minHeight: { xs: 'calc(100vh - 64px)', md: 'calc(100vh - 76px)' },
        display: 'flex',
        alignItems: 'center',
        py: { xs: 4, md: 7 },
        background:
          'linear-gradient(180deg, rgba(255,247,242,0.72) 0%, rgba(248,249,252,1) 42%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 520,
            mx: 'auto',
            p: { xs: 3, sm: 4.5 },
            borderRadius: 4,
            border: '1px solid rgba(229,57,53,0.1)',
            boxShadow: '0 24px 80px rgba(22, 24, 35, 0.12)',
          }}
        >
          <Stack spacing={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 54,
                  height: 54,
                  mx: 'auto',
                  mb: 1.5,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '16px',
                  color: '#d32f2f',
                  background: 'linear-gradient(135deg, #fff1ed 0%, #fff8e5 100%)',
                  boxShadow: 'inset 0 0 0 1px rgba(229,57,53,0.12)',
                }}
              >
                <RestaurantMenuOutlinedIcon fontSize="large" />
              </Box>
              <Typography variant="h4" fontWeight={900} color="error">
                QuickBite
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>
                Sign in to continue ordering your favorites.
              </Typography>
            </Box>

            {apiError && (
              <Alert severity="error" onClose={() => setApiError('')}>
                {apiError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.25}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ textAlign: 'right', mt: -1 }}>
                  <Link
                    to="/forgot-password"
                    style={{ color: '#d32f2f', fontWeight: 800, textDecoration: 'none', fontSize: 14 }}
                  >
                    Forgot password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="error"
                  size="large"
                  disabled={loading}
                  startIcon={!loading && <LoginOutlinedIcon />}
                  sx={{ minHeight: 54, mt: 0.5, borderRadius: 2.5 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                </Button>

                {GOOGLE_CLIENT_ID && (
                  <>
                    <Divider sx={{ color: 'text.secondary', fontSize: 13 }}>OR</Divider>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      onClick={handleGoogleLogin}
                      sx={{
                        minHeight: 52,
                        borderRadius: 2.5,
                        borderColor: 'rgba(26,115,232,0.22)',
                        backgroundColor: '#f7faff',
                        color: '#1a73e8',
                        fontWeight: 700,
                        '&:hover': {
                          borderColor: 'rgba(26,115,232,0.35)',
                          backgroundColor: '#eef5ff',
                        },
                      }}
                    >
                      <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        style={{ width: 20, height: 20, marginRight: 12 }}
                      />
                      Continue with Google
                    </Button>
                  </>
                )}

                <Typography align="center" variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    style={{ color: '#d32f2f', fontWeight: 800, textDecoration: 'none' }}
                  >
                    Register here
                  </Link>
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
