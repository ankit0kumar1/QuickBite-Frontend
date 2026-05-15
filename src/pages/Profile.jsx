// src/pages/Profile.jsx
import React, { useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Collapse,
  Container,
  Divider,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import EditIcon from '@mui/icons-material/Edit';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonIcon from '@mui/icons-material/Person';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import profileApi from '../api/profileApi';
import { useAuth } from '../context/AuthContext';

const ROLE_META = {
  CUSTOMER: { label: 'Customer', color: 'primary' },
  OWNER: { label: 'Restaurant Owner', color: 'warning' },
  AGENT: { label: 'Delivery Agent', color: 'info' },
  ADMIN: { label: 'Admin', color: 'error' },
};

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    minHeight: 56,
    borderRadius: 2.5,
    backgroundColor: '#fbfcff',
  },
};

const glassCardSx = {
  borderRadius: 4,
  border: '1px solid rgba(229,57,53,0.1)',
  boxShadow: '0 20px 60px rgba(24, 28, 42, 0.1)',
  background: 'rgba(255,255,255,0.96)',
};

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [profMsg, setProfMsg] = useState({ text: '', type: '' });
  const [profSaving, setProfSaving] = useState(false);

  const [pwdOpen, setPwdOpen] = useState(false);
  const [curPwd, setCurPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confPwd, setConfPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState({ text: '', type: '' });
  const [pwdSaving, setPwdSaving] = useState(false);

  const roleMeta = ROLE_META[user?.role] || { label: user?.role || 'User', color: 'default' };
  const initial = (fullName || user?.email || '?')[0].toUpperCase();

  const handleProfileSave = async () => {
    if (!fullName.trim()) {
      setProfMsg({ text: 'Full name cannot be empty', type: 'error' });
      return;
    }
    setProfSaving(true);
    setProfMsg({ text: '', type: '' });
    try {
      await profileApi.updateProfile({ fullName, phone });
      updateUser({ fullName, phone });
      setProfMsg({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setProfMsg({
        text: err.response?.data?.message || 'Failed to update profile. Please try again.',
        type: 'error',
      });
    } finally {
      setProfSaving(false);
    }
  };

  const validatePassword = () => {
    if (!curPwd) return 'Current password is required';
    if (!newPwd) return 'New password is required';
    if (newPwd.length < 8) return 'Password must be at least 8 characters long';
    if (!/[A-Z]/.test(newPwd)) return 'Password must contain at least one uppercase letter (A-Z)';
    if (!/[0-9]/.test(newPwd)) return 'Password must contain at least one number (0-9)';
    if (!/[^A-Za-z0-9]/.test(newPwd))
      return 'Password must contain at least one special character (!@#$%...)';
    if (newPwd !== confPwd) return 'New passwords do not match';
    if (newPwd === curPwd) return 'New password must be different from the current password';
    return null;
  };

  const handlePasswordChange = async () => {
    const err = validatePassword();
    if (err) {
      setPwdMsg({ text: err, type: 'error' });
      return;
    }

    setPwdSaving(true);
    setPwdMsg({ text: '', type: '' });
    try {
      await profileApi.changePassword({ currentPassword: curPwd, newPassword: newPwd });
      setPwdMsg({
        text: 'Password changed successfully! Please log in again with your new password.',
        type: 'success',
      });
      setCurPwd('');
      setNewPwd('');
      setConfPwd('');
      setTimeout(() => setPwdOpen(false), 3000);
    } catch (err) {
      setPwdMsg({
        text: err.response?.data?.message || 'Failed to change password. Check your current password.',
        type: 'error',
      });
    } finally {
      setPwdSaving(false);
    }
  };

  const strength = (() => {
    if (!newPwd) return null;
    let s = 0;
    if (newPwd.length >= 8) s++;
    if (/[A-Z]/.test(newPwd)) s++;
    if (/[0-9]/.test(newPwd)) s++;
    if (/[^A-Za-z0-9]/.test(newPwd)) s++;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['', '#ef4444', '#f59e0b', '#2563eb', '#22a447'];
    return { score: s, label: labels[s], color: colors[s] };
  })();

  const resetPasswordPanel = () => {
    setPwdOpen((open) => !open);
    setPwdMsg({ text: '', type: '' });
    setCurPwd('');
    setNewPwd('');
    setConfPwd('');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: { xs: 3, md: 5 },
        background:
          'linear-gradient(180deg, rgba(255,247,242,0.9) 0%, #f7f8fb 360px, #f7f8fb 100%)',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={900}>
            My Profile
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account, contact details, and security.
          </Typography>
        </Box>

        <Grid container spacing={3} alignItems="stretch">
          <Grid item xs={12} md={5}>
            <Paper elevation={0} sx={{ ...glassCardSx, height: '100%', overflow: 'hidden' }}>
              <Box
                sx={{
                  p: 3,
                  minHeight: 170,
                  color: '#fff',
                  background: 'linear-gradient(135deg, #d9282f 0%, #ff4b1f 100%)',
                }}
              >
                <Typography variant="overline" sx={{ opacity: 0.84, fontWeight: 800 }}>
                  QuickBite Account
                </Typography>
                <Typography variant="h5" fontWeight={900} sx={{ mt: 1 }}>
                  {fullName || user?.email}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.88 }}>
                  {user?.email}
                </Typography>
              </Box>

              <Box sx={{ p: 3, pt: 0, textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 112,
                    height: 112,
                    mx: 'auto',
                    mt: -7,
                    mb: 2,
                    border: '6px solid #fff',
                    background: 'linear-gradient(135deg, #d9282f, #ff7043)',
                    fontSize: 44,
                    fontWeight: 900,
                    boxShadow: '0 18px 38px rgba(217,40,47,0.28)',
                  }}
                >
                  {initial}
                </Avatar>

                <Chip
                  icon={<VerifiedUserOutlinedIcon />}
                  label={roleMeta.label}
                  color={roleMeta.color}
                  sx={{ fontWeight: 900, borderRadius: 999 }}
                />

                <Stack spacing={1.5} sx={{ mt: 3, textAlign: 'left' }}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <EmailOutlinedIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Email</Typography>
                      <Typography variant="body2" fontWeight={800}>{user?.email || 'Not available'}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <CallOutlinedIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Phone</Typography>
                      <Typography variant="body2" fontWeight={800}>{phone || 'Not added yet'}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <BadgeOutlinedIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Role</Typography>
                      <Typography variant="body2" fontWeight={800}>{roleMeta.label}</Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={7}>
            <Stack spacing={3}>
              <Paper elevation={0} sx={{ ...glassCardSx, p: { xs: 2.5, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2.5 }}>
                  <Avatar sx={{ bgcolor: 'rgba(217,40,47,0.1)', color: '#d9282f' }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={900}>Edit Profile</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Keep your delivery contact information up to date.
                    </Typography>
                  </Box>
                </Box>

                {profMsg.text && (
                  <Alert severity={profMsg.type} sx={{ mb: 2 }} onClose={() => setProfMsg({ text: '', type: '' })}>
                    {profMsg.text}
                  </Alert>
                )}

                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    sx={fieldSx}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><PersonIcon color="action" /></InputAdornment>,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    helperText="Used for order notifications"
                    inputProps={{ maxLength: 15 }}
                    sx={fieldSx}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><CallOutlinedIcon color="action" /></InputAdornment>,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={user?.email || ''}
                    disabled
                    helperText="Email address cannot be changed"
                    sx={fieldSx}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><EmailOutlinedIcon color="action" /></InputAdornment>,
                    }}
                  />

                  <Button
                    variant="contained"
                    color="error"
                    fullWidth
                    startIcon={<EditIcon />}
                    sx={{ minHeight: 54, borderRadius: 2.5, mt: 0.5 }}
                    onClick={handleProfileSave}
                    disabled={profSaving}
                  >
                    {profSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{ ...glassCardSx, p: { xs: 2.5, sm: 3 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                  onClick={resetPasswordPanel}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Avatar sx={{ bgcolor: 'rgba(217,40,47,0.1)', color: '#d9282f' }}>
                      <SecurityOutlinedIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={900}>Security</Typography>
                      <Typography variant="body2" color="text.secondary">Change your password securely.</Typography>
                    </Box>
                  </Box>
                  {pwdOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </Box>

                <Collapse in={pwdOpen} timeout="auto">
                  <Divider sx={{ my: 2.5 }} />

                  {pwdMsg.text && (
                    <Alert severity={pwdMsg.type} sx={{ mb: 2 }} onClose={() => setPwdMsg({ text: '', type: '' })}>
                      {pwdMsg.text}
                    </Alert>
                  )}

                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      type="password"
                      value={curPwd}
                      onChange={(e) => setCurPwd(e.target.value)}
                      autoComplete="current-password"
                      sx={fieldSx}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LockOutlinedIcon color="action" /></InputAdornment>,
                      }}
                    />
                    <TextField
                      fullWidth
                      label="New Password"
                      type="password"
                      value={newPwd}
                      onChange={(e) => setNewPwd(e.target.value)}
                      autoComplete="new-password"
                      sx={fieldSx}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LockOutlinedIcon color="action" /></InputAdornment>,
                      }}
                    />

                    {strength && (
                      <Box>
                        <Box sx={{ display: 'flex', gap: 0.5, mb: 0.75 }}>
                          {[1, 2, 3, 4].map((i) => (
                            <Box
                              key={i}
                              sx={{
                                flex: 1,
                                height: 6,
                                borderRadius: 999,
                                bgcolor: i <= strength.score ? strength.color : '#e5e7eb',
                                transition: 'background-color 0.25s ease',
                              }}
                            />
                          ))}
                        </Box>
                        <Typography variant="caption" sx={{ color: strength.color, fontWeight: 900 }}>
                          {strength.label}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          Use 8+ characters with uppercase, number, and special character.
                        </Typography>
                      </Box>
                    )}

                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      type="password"
                      value={confPwd}
                      onChange={(e) => setConfPwd(e.target.value)}
                      autoComplete="new-password"
                      error={confPwd.length > 0 && confPwd !== newPwd}
                      helperText={
                        confPwd.length > 0 && confPwd !== newPwd
                          ? 'Passwords do not match'
                          : confPwd.length > 0 && confPwd === newPwd
                            ? 'Passwords match'
                            : ''
                      }
                      FormHelperTextProps={{
                        sx: { color: confPwd === newPwd && confPwd ? 'success.main' : undefined },
                      }}
                      sx={fieldSx}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LockOutlinedIcon color="action" /></InputAdornment>,
                      }}
                    />

                    <Button
                      variant="contained"
                      color="error"
                      fullWidth
                      startIcon={<LockOutlinedIcon />}
                      sx={{ minHeight: 54, borderRadius: 2.5 }}
                      onClick={handlePasswordChange}
                      disabled={pwdSaving}
                    >
                      {pwdSaving ? 'Changing Password...' : 'Change Password'}
                    </Button>
                  </Stack>
                </Collapse>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Profile;
