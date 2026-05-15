// src/pages/agent/AgentOrders.jsx
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
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import DeliveryDiningOutlinedIcon from '@mui/icons-material/DeliveryDiningOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import OutboxOutlinedIcon from '@mui/icons-material/OutboxOutlined';
import PriceCheckOutlinedIcon from '@mui/icons-material/PriceCheckOutlined';
import deliveryApi from '../../api/deliveryApi';
import AppSnackbar from '../../components/common/AppSnackbar';

const STATUS_META = {
  ASSIGNED: { label: 'Assigned', color: '#2563eb', bg: '#eff6ff' },
  PICKED_UP: { label: 'Picked up', color: '#ea580c', bg: '#fff7ed' },
  DELIVERED: { label: 'Delivered', color: '#168039', bg: '#f0fdf4' },
  FAILED: { label: 'Failed', color: '#dc2626', bg: '#fef2f2' },
};

const cardSx = {
  borderRadius: 4,
  border: '1px solid rgba(20,24,35,0.08)',
  boxShadow: '0 16px 48px rgba(24,28,42,0.08)',
};

const AgentOrders = () => {
  const navigate = useNavigate();

  const [available, setAvailable] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const assignmentsRes = await deliveryApi.getMyAssignments();
      setAssignments(assignmentsRes.data);

      try {
        const availableRes = await deliveryApi.getAvailableOrders();
        setAvailable(availableRes.data);
      } catch (err) {
        setAvailable([]);
        setError(err.response?.data?.message || 'Failed to load available orders');
      }
    } catch (err) {
      setAssignments([]);
      setAvailable([]);
      setError(err.response?.data?.message || 'Failed to load delivery orders');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (orderId) => {
    try {
      await deliveryApi.claimOrder(orderId);
      setSnack({ open: true, message: 'Order accepted', severity: 'success' });
      fetchOrders();
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || 'Failed to accept order', severity: 'error' });
    }
  };

  const handlePickup = async (id) => {
    try {
      await deliveryApi.markPickedUp(id);
      setSnack({ open: true, message: 'Order marked as picked up', severity: 'success' });
      fetchOrders();
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || 'Failed to mark pickup', severity: 'error' });
    }
  };

  const handleDeliver = async (id) => {
    try {
      await deliveryApi.markDelivered(id);
      setSnack({ open: true, message: 'Order marked as delivered', severity: 'success' });
      fetchOrders();
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || 'Failed to mark delivery', severity: 'error' });
    }
  };

  const active = assignments.filter((assignment) =>
    !['DELIVERED', 'FAILED'].includes(assignment.status)
  );
  const past = assignments.filter((assignment) =>
    ['DELIVERED', 'FAILED'].includes(assignment.status)
  );
  const display = tab === 1 ? active : past;

  const renderEmpty = (message) => (
    <Paper elevation={0} sx={{ ...cardSx, textAlign: 'center', py: 7, px: 3 }}>
      <OutboxOutlinedIcon color="disabled" sx={{ fontSize: 46, mb: 1 }} />
      <Typography variant="h6" fontWeight={900}>
        {message}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        New assignments will appear here automatically.
      </Typography>
    </Paper>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: { xs: 3, md: 5 },
        background: 'linear-gradient(180deg, rgba(255,247,242,0.9) 0%, #f7f8fb 360px, #f7f8fb 100%)',
      }}
    >
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/agent')}
          color="inherit"
          sx={{ mb: 2, borderRadius: 999, fontWeight: 900 }}
        >
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
              <DeliveryDiningOutlinedIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={900}>
                Delivery Orders
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.88 }}>
                Claim, track, and complete your assigned deliveries.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: 1, mb: 3, borderRadius: 999, display: 'inline-flex', border: '1px solid rgba(20,24,35,0.08)' }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            textColor="error"
            indicatorColor="error"
            sx={{
              minHeight: 42,
              '& .MuiTabs-indicator': { display: 'none' },
              '& .MuiTab-root': { minHeight: 42, borderRadius: 999, px: 2.5, fontWeight: 900 },
              '& .Mui-selected': { bgcolor: 'rgba(217,40,47,0.1)' },
            }}
          >
            <Tab label={`Available (${available.length})`} />
            <Tab label={`Active (${active.length})`} />
            <Tab label={`Past (${past.length})`} />
          </Tabs>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="error" />
          </Box>
        ) : tab === 0 ? (
          available.length === 0 ? renderEmpty('No prepared orders available right now') : (
            <Stack spacing={2.25}>
              {available.map((order) => (
                <Paper key={order.orderId} elevation={0} sx={{ ...cardSx, p: { xs: 2.5, md: 3 } }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                    <Avatar sx={{ bgcolor: '#fff7ed', color: '#ea580c' }}>
                      <DeliveryDiningOutlinedIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                        <Typography variant="h6" fontWeight={900}>Order #{order.orderId}</Typography>
                        <Chip label={order.orderStatus} sx={{ bgcolor: '#fff7ed', color: '#ea580c', fontWeight: 900, borderRadius: 999 }} />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        Restaurant #{order.restaurantId} - Customer #{order.customerId}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                        <LocationOnOutlinedIcon color="action" fontSize="small" />
                        <Typography variant="body2">{order.deliveryAddress}</Typography>
                      </Stack>
                    </Box>
                    <Stack alignItems={{ sm: 'flex-end' }} spacing={1}>
                      <Typography variant="h6" fontWeight={900}>Rs {Number(order.finalAmount || 0).toFixed(0)}</Typography>
                      <Button variant="contained" color="error" startIcon={<CheckCircleOutlineRoundedIcon />} sx={{ borderRadius: 999 }} onClick={() => handleClaim(order.orderId)}>
                        Accept
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )
        ) : display.length === 0 ? (
          renderEmpty(tab === 1 ? 'No active deliveries' : 'No past deliveries')
        ) : (
          <Stack spacing={2.25}>
            {display.map((assignment) => {
              const meta = STATUS_META[assignment.status] || STATUS_META.ASSIGNED;
              return (
                <Paper key={assignment.assignmentId} elevation={0} sx={{ ...cardSx, p: { xs: 2.5, md: 3 } }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                    <Avatar sx={{ bgcolor: meta.bg, color: meta.color }}>
                      <DeliveryDiningOutlinedIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                        <Typography variant="h6" fontWeight={900}>Order #{assignment.orderId}</Typography>
                        <Chip label={meta.label} sx={{ bgcolor: meta.bg, color: meta.color, fontWeight: 900, borderRadius: 999 }} />
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                        <LocationOnOutlinedIcon color="action" fontSize="small" />
                        <Typography variant="body2">{assignment.deliveryAddress}</Typography>
                      </Stack>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {assignment.status === 'ASSIGNED' && (
                      <Button variant="contained" color="warning" startIcon={<DeliveryDiningOutlinedIcon />} sx={{ borderRadius: 999 }} onClick={() => handlePickup(assignment.assignmentId)}>
                        Mark Picked Up
                      </Button>
                    )}
                    {assignment.status === 'PICKED_UP' && (
                      <Button variant="contained" color="success" startIcon={<PriceCheckOutlinedIcon />} sx={{ borderRadius: 999 }} onClick={() => handleDeliver(assignment.assignmentId)}>
                        Mark Delivered
                      </Button>
                    )}
                    <Button variant="outlined" startIcon={<MapOutlinedIcon />} sx={{ borderRadius: 999 }} onClick={() => navigate(`/delivery/track/${assignment.orderId}`)}>
                      View Map
                    </Button>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
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

export default AgentOrders;
