// src/pages/agent/AgentRegister.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Paper,
  TextField, Button, Alert, CircularProgress,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import deliveryApi from '../../api/deliveryApi';
import { useAuth } from '../../context/AuthContext';

const VEHICLE_TYPES = ['BIKE', 'SCOOTER', 'CYCLE', 'CAR'];

const AgentRegister = () => {
  const navigate   = useNavigate();
  const { user }   = useAuth();

  const [form, setForm] = useState({
    fullName    : user?.fullName || '',
    phone       : '',
    vehicleType : 'BIKE',
    vehicleNumber: '',
    licenseNumber: '',
  });

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.fullName.trim())    return 'Full name is required';
    if (!form.phone.trim() || form.phone.length < 10)
      return 'Enter a valid 10-digit phone number';
    if (!form.vehicleNumber.trim()) return 'Vehicle number is required';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }

    setError('');
    setLoading(true);
    try {
      await deliveryApi.registerAgent({
        userId       : user?.userId,          // required by backend @NotNull
        fullName     : form.fullName,
        phone        : form.phone,
        vehicleType  : form.vehicleType,
        vehicleNumber: form.vehicleNumber,
        licenseNumber: form.licenseNumber,    // optional but send it
      });
      setSuccess('Registration successful! Your profile is pending admin verification.');
      setTimeout(() => navigate('/agent'), 2500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Registration failed. You may already be registered.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ borderRadius: 3, p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <TwoWheelerIcon sx={{ fontSize: 56, color: '#d32f2f' }} />
            <Typography variant="h5" fontWeight="bold" mt={1}>
              Register as Delivery Agent
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Complete your profile to start accepting deliveries
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <TextField
            fullWidth label="Full Name" name="fullName"
            value={form.fullName} onChange={handleChange}
            margin="dense" size="small"
          />
          <TextField
            fullWidth label="Phone Number" name="phone"
            value={form.phone} onChange={handleChange}
            margin="dense" size="small"
            inputProps={{ maxLength: 10 }}
            helperText="10-digit mobile number"
          />

          <FormControl fullWidth margin="dense" size="small">
            <InputLabel>Vehicle Type</InputLabel>
            <Select
              value={form.vehicleType}
              label="Vehicle Type"
              name="vehicleType"
              onChange={handleChange}
            >
              {VEHICLE_TYPES.map(v => (
                <MenuItem key={v} value={v}>{v}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth label="Vehicle Number (e.g. MH12AB1234)" name="vehicleNumber"
            value={form.vehicleNumber} onChange={handleChange}
            margin="dense" size="small"
          />
          <TextField
            fullWidth label="Driving License Number (optional)" name="licenseNumber"
            value={form.licenseNumber} onChange={handleChange}
            margin="dense" size="small"
          />

          <Button
            fullWidth variant="contained" color="error"
            size="large" sx={{ mt: 3, borderRadius: 2, py: 1.5 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <CircularProgress size={24} color="inherit" />
              : '🛵 Register as Delivery Agent'}
          </Button>

          <Button
            fullWidth variant="text" color="inherit"
            sx={{ mt: 1 }}
            onClick={() => navigate('/agent')}
          >
            Back to Dashboard
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default AgentRegister;
