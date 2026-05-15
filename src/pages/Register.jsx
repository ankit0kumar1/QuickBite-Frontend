// src/pages/Register.jsx
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
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
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

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'CUSTOMER',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';

    if (!formData.email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errs.email = 'Enter a valid email address';

    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 8)
      errs.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(formData.password))
      errs.password = 'Password must contain at least one uppercase letter (A-Z)';
    else if (!/[0-9]/.test(formData.password))
      errs.password = 'Password must contain at least one number (0-9)';
    else if (!/[^A-Za-z0-9]/.test(formData.password))
      errs.password = 'Password must contain at least one special character (!@#$...)';

    if (formData.phone && !/^\+?[0-9]{7,15}$/.test(formData.phone))
      errs.phone = 'Enter a valid phone number';

    return errs;
  };

  const strength = (() => {
    const p = formData.password;
    if (!p) return null;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['', '#ef4444', '#f59e0b', '#2563eb', '#22a447'];
    return { score: s, label: labels[s], color: colors[s] };
  })();

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
      const registeredUser = await register(formData);
      navigate(getRoleHomePath(registeredUser?.role), { replace: true });
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please try again.'
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
        py: { xs: 3, md: 5 },
        background:
          'linear-gradient(180deg, rgba(255,247,242,0.72) 0%, rgba(248,249,252,1) 42%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 560,
            mx: 'auto',
            p: { xs: 3, sm: 4.25 },
            borderRadius: 4,
            border: '1px solid rgba(229,57,53,0.1)',
            boxShadow: '0 24px 80px rgba(22, 24, 35, 0.12)',
          }}
        >
          <Stack spacing={2.5}>
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 54,
                  height: 54,
                  mx: 'auto',
                  mb: 1.25,
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
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                Create your account and start ordering faster.
              </Typography>
            </Box>

            {apiError && (
              <Alert severity="error" onClose={() => setApiError('')}>
                {apiError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={1.9}>
                <TextField
                  fullWidth
                  label="Full name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  error={!!errors.fullName}
                  helperText={errors.fullName}
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineOutlinedIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
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

                {strength && (
                  <Box sx={{ mt: -0.75 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 0.75 }}>
                      {[1, 2, 3, 4].map((i) => (
                        <Box
                          key={i}
                          sx={{
                            flex: 1,
                            height: 5,
                            borderRadius: 999,
                            bgcolor: i <= strength.score ? strength.color : '#e5e7eb',
                            transition: 'background-color 0.25s ease',
                          }}
                        />
                      ))}
                    </Box>
                    <Typography variant="caption" sx={{ color: strength.color, fontWeight: 800 }}>
                      {strength.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                      sx={{ mt: 0.25 }}
                    >
                      Use 8+ characters with uppercase, number, and special character.
                    </Typography>
                  </Box>
                )}

                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!errors.phone}
                  helperText={errors.phone || 'Optional, used for order notifications'}
                  inputProps={{ maxLength: 15 }}
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneOutlinedIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControl fullWidth>
                  <InputLabel>I am a</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    label="I am a"
                    onChange={handleChange}
                    sx={{
                      minHeight: 56,
                      borderRadius: 2.5,
                      backgroundColor: '#fbfcff',
                    }}
                  >
                    <MenuItem value="CUSTOMER">Customer - Order food</MenuItem>
                    <MenuItem value="OWNER">Restaurant owner - List my restaurant</MenuItem>
                    <MenuItem value="AGENT">Delivery agent - Deliver orders</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="error"
                  size="large"
                  disabled={loading}
                  sx={{ minHeight: 54, mt: 0.25, borderRadius: 2.5 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
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
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    style={{ color: '#d32f2f', fontWeight: 800, textDecoration: 'none' }}
                  >
                    Login here
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

export default Register;
