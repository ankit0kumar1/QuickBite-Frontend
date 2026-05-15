import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import deliveryApi from '../api/deliveryApi';
import DeliveryLiveMap from '../components/delivery/DeliveryLiveMap';
import { connectToOrderTracking } from '../utils/deliveryTrackingSocket';

const STATUS_COLORS = {
  ASSIGNED: 'info',
  PICKED_UP: 'warning',
  DELIVERED: 'success',
  FAILED: 'error',
};

const DeliveryTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liveConnected, setLiveConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await deliveryApi.trackOrder(orderId);
        if (!cancelled) {
          setTracking(res.data);
        }
      } catch {
        if (!cancelled) {
          setError('No delivery tracking found for this order yet.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    socketRef.current = connectToOrderTracking(orderId, (payload) => {
      setTracking(payload);
      setError('');
      setLiveConnected(true);
    });

    const refreshFallback = setInterval(async () => {
      try {
        const res = await deliveryApi.trackOrder(orderId);
        setTracking(res.data);
      } catch {
        // keep quiet during fallback refresh
      }
    }, 20000);

    return () => {
      cancelled = true;
      clearInterval(refreshFallback);
      if (socketRef.current) {
        socketRef.current.deactivate();
        socketRef.current = null;
      }
    };
  }, [orderId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress color="error" />
      </Box>
    );
  }

  if (error && !tracking) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} sx={{ mt: 2 }} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} color="inherit">
            Back
          </Button>
          <Typography variant="h5" fontWeight="bold">
            Live Delivery Tracking
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ borderRadius: 3, p: 3, mb: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Order #{orderId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tracking?.restaurantName || 'Restaurant'} to your delivery location
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={tracking?.status || 'TRACKING'}
                color={STATUS_COLORS[tracking?.status] || 'default'}
                sx={{ fontWeight: 'bold' }}
              />
              <Chip
                label={liveConnected ? 'LIVE' : 'SYNCED'}
                color={liveConnected ? 'success' : 'default'}
                variant={liveConnected ? 'filled' : 'outlined'}
              />
            </Stack>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ borderRadius: 3, p: 3, mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Live Route
          </Typography>
          <DeliveryLiveMap tracking={tracking} height={360} />
        </Paper>

        {tracking?.agentName && (
          <Paper elevation={0} sx={{ borderRadius: 3, p: 3, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Delivery Agent
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#d32f2f', width: 52, height: 52 }}>
                <DirectionsBikeIcon />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {tracking.agentName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {tracking.agentPhone}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<PhoneIcon />}
                href={`tel:${tracking.agentPhone}`}
                sx={{ borderRadius: 2 }}
              >
                Call
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={1}>
              <Typography variant="body2">
                Agent location: {tracking?.agentLatitude?.toFixed?.(5) ?? '--'}, {tracking?.agentLongitude?.toFixed?.(5) ?? '--'}
              </Typography>
              <Typography variant="body2">
                Destination: {tracking?.deliveryAddress}
              </Typography>
              {tracking?.locationUpdatedAt && (
                <Typography variant="caption" color="text.secondary">
                  Last location update: {new Date(tracking.locationUpdatedAt).toLocaleString()}
                </Typography>
              )}
            </Stack>
          </Paper>
        )}

        <Paper elevation={0} sx={{ borderRadius: 3, p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LocationOnIcon color="action" />
            <Typography variant="subtitle2" fontWeight="bold">
              Delivery Address
            </Typography>
          </Box>
          <Typography variant="body2">{tracking?.deliveryAddress}</Typography>

          {tracking?.status === 'DELIVERED' && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Your order has been delivered.
            </Alert>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default DeliveryTracking;
