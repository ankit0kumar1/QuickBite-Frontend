// src/pages/agent/AgentLocation.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GpsFixedOutlinedIcon from '@mui/icons-material/GpsFixedOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';
import deliveryApi from '../../api/deliveryApi';
import DeliveryLiveMap from '../../components/delivery/DeliveryLiveMap';

const shouldSendUpdate = (lastSent, nextPoint) => {
  if (!lastSent) return true;
  const elapsed = Date.now() - lastSent.timestamp;
  if (elapsed > 8000) return true;
  const latDelta = Math.abs(lastSent.latitude - nextPoint.latitude);
  const lngDelta = Math.abs(lastSent.longitude - nextPoint.longitude);
  return latDelta > 0.0002 || lngDelta > 0.0002;
};

const infoCardSx = {
  p: 2.25,
  borderRadius: 3,
  border: '1px solid rgba(20,24,35,0.08)',
  bgcolor: '#fff',
};

const AgentLocation = () => {
  const navigate = useNavigate();
  const watchIdRef = useRef(null);
  const lastSentRef = useRef(null);

  const [tracking, setTracking] = useState(null);
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState('');
  const [statusText, setStatusText] = useState('Preparing live location sharing...');

  const hasActiveDelivery = useMemo(
    () => tracking && ['ASSIGNED', 'PICKED_UP'].includes(tracking.status),
    [tracking]
  );

  useEffect(() => {
    let mounted = true;

    const loadActiveAssignment = async () => {
      setLoading(true);
      setError('');
      try {
        const assignmentsRes = await deliveryApi.getMyAssignments();
        const active = (assignmentsRes.data || []).find((item) =>
          ['ASSIGNED', 'PICKED_UP'].includes(item.status)
        );

        if (!active) {
          if (mounted) {
            setTracking(null);
            setStatusText('No active delivery right now.');
          }
          return;
        }

        const trackingRes = await deliveryApi.trackOrder(active.orderId);
        if (mounted) {
          setTracking(trackingRes.data);
          setStatusText('Live location sharing is ready for this delivery.');
        }
      } catch {
        if (mounted) setError('Unable to load your active delivery route.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadActiveAssignment();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasActiveDelivery) return undefined;

    if (!navigator.geolocation) {
      setError('Geolocation is not supported on this device.');
      return undefined;
    }

    setSharing(true);
    setStatusText('Sharing your live location with the customer.');

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (geoPosition) => {
        const nextPoint = {
          latitude: Number(geoPosition.coords.latitude.toFixed(6)),
          longitude: Number(geoPosition.coords.longitude.toFixed(6)),
        };

        setPosition(nextPoint);
        if (!shouldSendUpdate(lastSentRef.current, nextPoint)) return;

        try {
          await deliveryApi.updateLocation(nextPoint);
          lastSentRef.current = { ...nextPoint, timestamp: Date.now() };
          setTracking((prev) => (
            prev
              ? {
                  ...prev,
                  agentLatitude: nextPoint.latitude,
                  agentLongitude: nextPoint.longitude,
                  locationUpdatedAt: new Date().toISOString(),
                }
              : prev
          ));
          setError('');
        } catch {
          setError('Failed to push your location update.');
        }
      },
      () => {
        setError('Unable to access GPS. Please allow location access for live tracking.');
        setSharing(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setSharing(false);
    };
  }, [hasActiveDelivery]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress color="error" />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: { xs: 3, md: 5 },
        background: 'linear-gradient(180deg, rgba(255,247,242,0.9) 0%, #f7f8fb 360px, #f7f8fb 100%)',
      }}
    >
      <Container maxWidth="lg">
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/agent')} color="inherit" sx={{ mb: 2, borderRadius: 999, fontWeight: 900 }}>
          Back
        </Button>

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
              <GpsFixedOutlinedIcon fontSize="large" />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight={900}>
                Live Delivery Location
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.88 }}>
                {tracking ? `Order #${tracking.orderId}` : 'No active order'} - {statusText}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Chip icon={<MyLocationIcon />} label={sharing ? 'Live sharing' : 'Idle'} sx={{ bgcolor: '#fff', color: sharing ? '#168039' : '#6b7280', fontWeight: 900 }} />
              {tracking?.status && <Chip label={tracking.status} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 900 }} />}
            </Stack>
          </Stack>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {tracking ? (
          <>
            <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 4, mb: 3, border: '1px solid rgba(20,24,35,0.08)', boxShadow: '0 16px 48px rgba(24,28,42,0.08)' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={900}>Delivery Route</Typography>
                  <Typography variant="body2" color="text.secondary">Restaurant pickup to customer drop-off with your live GPS.</Typography>
                </Box>
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                  <Chip label="Restaurant" sx={{ bgcolor: '#fff7ed', color: '#9a3412', fontWeight: 900 }} />
                  <Chip label="Customer" sx={{ bgcolor: '#ecfdf5', color: '#166534', fontWeight: 900 }} />
                  <Chip label="Agent" sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 900 }} />
                </Stack>
              </Stack>
              <Box sx={{ overflow: 'hidden', borderRadius: 3, border: '1px solid rgba(20,24,35,0.08)' }}>
                <DeliveryLiveMap
                  tracking={{
                    ...tracking,
                    agentLatitude: position?.latitude ?? tracking.agentLatitude,
                    agentLongitude: position?.longitude ?? tracking.agentLongitude,
                  }}
                  height={460}
                />
              </Box>
            </Paper>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Paper elevation={0} sx={{ ...infoCardSx, flex: 1 }}>
                <Stack direction="row" spacing={1.25}>
                  <RestaurantMenuOutlinedIcon color="warning" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Pickup</Typography>
                    <Typography variant="body1" fontWeight={900}>{tracking.restaurantName || 'Restaurant'}</Typography>
                  </Box>
                </Stack>
              </Paper>
              <Paper elevation={0} sx={{ ...infoCardSx, flex: 1 }}>
                <Stack direction="row" spacing={1.25}>
                  <LocationOnOutlinedIcon color="success" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Deliver to</Typography>
                    <Typography variant="body1" fontWeight={900}>{tracking.deliveryAddress}</Typography>
                  </Box>
                </Stack>
              </Paper>
              <Paper elevation={0} sx={{ ...infoCardSx, flex: 1 }}>
                <Stack direction="row" spacing={1.25}>
                  <GpsFixedOutlinedIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Current GPS</Typography>
                    <Typography variant="body1" fontWeight={900}>
                      {position ? `${position.latitude}, ${position.longitude}` : 'Waiting for GPS...'}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </>
        ) : (
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid rgba(20,24,35,0.08)' }}>
            <Typography variant="h6" fontWeight={900}>No active delivery</Typography>
            <Typography variant="body1" color="text.secondary">
              Once you accept an order, this page will start sharing your live location and show the route.
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default AgentLocation;
