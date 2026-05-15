// src/pages/agent/AgentDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import DeliveryDiningOutlinedIcon from '@mui/icons-material/DeliveryDiningOutlined';
import GpsFixedOutlinedIcon from '@mui/icons-material/GpsFixedOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import deliveryApi from '../../api/deliveryApi';
import AppSnackbar from '../../components/common/AppSnackbar';

const statusMeta = {
  ONLINE: { label: 'Online', color: '#168039', bg: '#f0fdf4' },
  BUSY: { label: 'Busy', color: '#ea580c', bg: '#fff7ed' },
  OFFLINE: { label: 'Offline', color: '#6b7280', bg: '#f3f4f6' },
};

const ActionCard = ({ icon, title, subtitle, onClick, color }) => (
  <Paper
    elevation={0}
    onClick={onClick}
    sx={{
      p: 3,
      height: '100%',
      borderRadius: 4,
      cursor: 'pointer',
      border: '1px solid rgba(20,24,35,0.08)',
      boxShadow: '0 16px 46px rgba(24,28,42,0.08)',
      transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
      '&:hover': {
        transform: 'translateY(-6px)',
        boxShadow: '0 24px 60px rgba(24,28,42,0.14)',
        borderColor: `${color}44`,
      },
    }}
  >
    <Stack spacing={2}>
      <Avatar sx={{ width: 58, height: 58, bgcolor: `${color}18`, color }}>
        {icon}
      </Avatar>
      <Box>
        <Typography variant="h6" fontWeight={900}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
      <Button endIcon={<ArrowForwardRoundedIcon />} sx={{ alignSelf: 'flex-start', borderRadius: 999, fontWeight: 900 }}>
        Open
      </Button>
    </Stack>
  </Paper>
);

const AgentDashboard = () => {
  const navigate = useNavigate();

  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await deliveryApi.getMyProfile();
      setAgent(res.data);
    } catch {
      setError('Profile not found. Register as agent.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    const newStatus = agent.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    try {
      const res = await deliveryApi.updateStatus(newStatus);
      setAgent(res.data);
      setSnack({ open: true, message: `You are now ${newStatus.toLowerCase()}`, severity: 'success' });
    } catch {
      setSnack({ open: true, message: 'Failed to update status', severity: 'error' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress color="error" />
      </Box>
    );
  }

  const meta = statusMeta[agent?.status] || statusMeta.OFFLINE;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: { xs: 3, md: 5 },
        background: 'linear-gradient(180deg, rgba(255,247,242,0.9) 0%, #f7f8fb 360px, #f7f8fb 100%)',
      }}
    >
      <Container maxWidth="lg">
        {error ? (
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid rgba(20,24,35,0.08)' }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Button variant="contained" color="error" onClick={() => navigate('/agent/register')} sx={{ borderRadius: 999 }}>
              Register as Delivery Agent
            </Button>
          </Paper>
        ) : (
          <>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                mb: 3,
                borderRadius: 4,
                color: '#fff',
                background: 'linear-gradient(135deg, #d9282f 0%, #ff4b1f 100%)',
                boxShadow: '0 22px 64px rgba(217,40,47,0.24)',
              }}
            >
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ md: 'center' }}>
                <Avatar
                  sx={{
                    width: 76,
                    height: 76,
                    bgcolor: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.25)',
                  }}
                >
                  <DeliveryDiningOutlinedIcon fontSize="large" />
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="overline" sx={{ opacity: 0.82, fontWeight: 900 }}>
                    Agent Dashboard
                  </Typography>
                  <Typography variant="h4" fontWeight={900}>
                    {agent?.fullName}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.88 }}>
                    {agent?.vehicleType} - {agent?.vehicleNumber}
                  </Typography>
                  <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mt: 1.5 }}>
                    <Chip
                      icon={<StarRoundedIcon />}
                      label={`${agent?.avgRating?.toFixed(1)} rating`}
                      sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 900 }}
                    />
                    <Chip
                      icon={<Inventory2OutlinedIcon />}
                      label={`${agent?.totalDeliveries} deliveries`}
                      sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 900 }}
                    />
                    <Chip
                      icon={agent?.isVerified ? <VerifiedOutlinedIcon /> : undefined}
                      label={agent?.isVerified ? 'Verified Agent' : 'Pending Verification'}
                      sx={{ bgcolor: '#fff', color: '#d9282f', fontWeight: 900 }}
                    />
                  </Stack>
                </Box>

                <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.16)', minWidth: 180 }}>
                  <Chip
                    label={meta.label}
                    sx={{
                      width: '100%',
                      mb: 1.25,
                      color: meta.color,
                      bgcolor: '#fff',
                      fontWeight: 900,
                      borderRadius: 999,
                    }}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    color={agent?.status === 'ONLINE' ? 'inherit' : 'success'}
                    onClick={handleStatusToggle}
                    disabled={agent?.status === 'BUSY'}
                    startIcon={<CheckCircleOutlineRoundedIcon />}
                    sx={{ borderRadius: 999, fontWeight: 900 }}
                  >
                    {agent?.status === 'ONLINE' ? 'Go Offline' : 'Go Online'}
                  </Button>
                </Paper>
              </Stack>
            </Paper>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <ActionCard
                  icon={<Inventory2OutlinedIcon />}
                  title="My Deliveries"
                  subtitle="Manage assignments and update delivery progress."
                  color="#2563eb"
                  onClick={() => navigate('/agent/orders')}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <ActionCard
                  icon={<GpsFixedOutlinedIcon />}
                  title="Live Location"
                  subtitle="Share GPS updates while an order is active."
                  color="#168039"
                  onClick={() => navigate('/agent/location')}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <ActionCard
                  icon={<AccountBalanceWalletOutlinedIcon />}
                  title="My Earnings"
                  subtitle="View deliveries, ratings, and estimated income."
                  color="#f59e0b"
                  onClick={() => navigate('/agent/earnings')}
                />
              </Grid>
            </Grid>
          </>
        )}
        <AppSnackbar
          open={snack.open}
          message={snack.message}
          severity={snack.severity}
          onClose={() => setSnack((current) => ({ ...current, open: false }))}
        />
      </Container>
    </Box>
  );
};

export default AgentDashboard;
