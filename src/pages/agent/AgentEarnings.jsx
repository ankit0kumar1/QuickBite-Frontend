// src/pages/agent/AgentEarnings.jsx
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Rating,
  Stack,
  Typography,
} from '@mui/material';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import StarIcon from '@mui/icons-material/Star';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import deliveryApi from '../../api/deliveryApi';
import reviewApi from '../../api/reviewApi';
import { AGENT_DELIVERY_PAYOUT } from '../../utils/orderCharges';

const StatCard = ({ icon, label, value, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      height: '100%',
      borderRadius: 4,
      border: '1px solid rgba(20,24,35,0.08)',
      boxShadow: '0 16px 48px rgba(24,28,42,0.08)',
    }}
  >
    <Stack direction="row" spacing={2} alignItems="center">
      <Avatar sx={{ width: 58, height: 58, bgcolor: `${color}18`, color }}>
        {icon}
      </Avatar>
      <Box>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="h4" fontWeight={900}>{value}</Typography>
      </Box>
    </Stack>
  </Paper>
);

const AgentEarnings = () => {
  const [summary, setSummary] = useState(null);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const res = await deliveryApi.getMyEarnings();
      setSummary(res.data);
      if (res.data?.agentId) {
        try {
          const ratingRes = await reviewApi.getAvgDeliveryRating(res.data.agentId);
          setRatingSummary(ratingRes.data);
        } catch {
          setRatingSummary(null);
        }
      }
    } catch {
      setError('Failed to load earnings. Make sure you are registered as an agent.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress color="error" />
      </Box>
    );
  }

  const averageRating = ratingSummary?.averageRating ?? summary?.avgRating ?? 0;
  const deliveryRatingCount = ratingSummary?.totalReviews ?? 0;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: { xs: 3, md: 5 },
        background: 'linear-gradient(180deg, rgba(255,247,242,0.9) 0%, #f7f8fb 360px, #f7f8fb 100%)',
      }}
    >
      <Container maxWidth="lg">
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
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <Avatar sx={{ width: 62, height: 62, bgcolor: 'rgba(255,255,255,0.18)' }}>
              <AccountBalanceWalletOutlinedIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={900}>My Earnings</Typography>
              <Typography variant="body1" sx={{ opacity: 0.88 }}>
                Track deliveries, estimated income, and customer rating.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {summary && (
          <>
            <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 4, mb: 3, border: '1px solid rgba(20,24,35,0.08)', boxShadow: '0 16px 48px rgba(24,28,42,0.08)' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(217,40,47,0.1)', color: '#d9282f', fontWeight: 900 }}>
                  {(summary.fullName || 'A')[0].toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" fontWeight={900}>{summary.fullName}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip
                      icon={summary.isVerified ? <VerifiedOutlinedIcon /> : undefined}
                      label={summary.isVerified ? 'Verified Agent' : 'Pending Verification'}
                      color={summary.isVerified ? 'success' : 'warning'}
                      sx={{ fontWeight: 900, borderRadius: 999 }}
                    />
                    <Chip label={summary.currentStatus} sx={{ fontWeight: 900, borderRadius: 999 }} />
                  </Stack>
                </Box>
              </Stack>
            </Paper>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <StatCard
                  icon={<LocalShippingIcon />}
                  label="Total Deliveries"
                  value={summary.totalDeliveries}
                  color="#2563eb"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StatCard
                  icon={<MonetizationOnIcon />}
                  label="Estimated Earnings"
                  value={`Rs ${summary.estimatedEarnings?.toFixed(0)}`}
                  color="#168039"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StatCard
                  icon={<StarIcon />}
                  label="Average Rating"
                  value={averageRating.toFixed(1)}
                  color="#f59e0b"
                />
              </Grid>
            </Grid>

            <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 4, mt: 3, border: '1px solid rgba(20,24,35,0.08)', boxShadow: '0 16px 48px rgba(24,28,42,0.08)' }}>
              <Typography variant="h6" fontWeight={900} gutterBottom>
                Customer Rating
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                <Rating value={averageRating} readOnly precision={0.1} size="large" />
                <Typography variant="body2" color="text.secondary">
                  {deliveryRatingCount > 0
                    ? `Based on ${deliveryRatingCount} delivery rating${deliveryRatingCount !== 1 ? 's' : ''}`
                    : 'No delivery ratings yet'}
                </Typography>
              </Stack>
            </Paper>

            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, mt: 2, bgcolor: '#fff7ed', border: '1px solid rgba(234,88,12,0.14)' }}>
              <Stack direction="row" spacing={1.25}>
                <InfoOutlinedIcon sx={{ color: '#ea580c' }} />
                <Typography variant="body2" color="text.secondary">
                  Earnings are estimated at Rs {AGENT_DELIVERY_PAYOUT} per completed delivery from the delivery charge.
                </Typography>
              </Stack>
            </Paper>
          </>
        )}
      </Container>
    </Box>
  );
};

export default AgentEarnings;
