// src/pages/admin/AllOrders.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import orderApi from '../../api/orderApi';
import restaurantApi from '../../api/restaurantApi';
import { calculateOrderCharges, money } from '../../utils/orderCharges';

const STATUS_META = {
  ALL: { label: 'All', color: 'default', bg: '#eef2ff', fg: '#3730a3' },
  PLACED: { label: 'Placed', color: 'warning', bg: '#fff7ed', fg: '#c2410c' },
  CONFIRMED: { label: 'Confirmed', color: 'info', bg: '#eff6ff', fg: '#1d4ed8' },
  PREPARING: { label: 'Preparing', color: 'info', bg: '#ecfeff', fg: '#0e7490' },
  PICKED_UP: { label: 'Picked up', color: 'primary', bg: '#eef2ff', fg: '#4338ca' },
  DELIVERED: { label: 'Delivered', color: 'success', bg: '#f0fdf4', fg: '#15803d' },
  CANCELLED: { label: 'Cancelled', color: 'error', bg: '#fef2f2', fg: '#b91c1c' },
};

const formatDate = (date) => {
  if (!date) return 'No date';
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const StatCard = ({ label, value, icon, accent }) => (
  <Paper elevation={0} sx={{ p: 2.25, borderRadius: 4, border: '1px solid rgba(20,24,35,0.08)', boxShadow: '0 14px 42px rgba(24,28,42,0.06)' }}>
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
      <Box>
        <Typography variant="body2" color="text.secondary" fontWeight={700}>{label}</Typography>
        <Typography variant="h4" fontWeight={950} sx={{ mt: 0.25 }}>{value}</Typography>
      </Box>
      <Avatar sx={{ bgcolor: accent, color: '#fff', width: 48, height: 48 }}>{icon}</Avatar>
    </Stack>
  </Paper>
);

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('ALL');

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await orderApi.getAllOrders();
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch {
      try {
        const restaurantsRes = await restaurantApi.getAll();
        const restaurants = Array.isArray(restaurantsRes.data) ? restaurantsRes.data : [];
        const settled = await Promise.allSettled(
          restaurants.map((restaurant) => orderApi.getOrdersByRestaurant(restaurant.restaurantId))
        );
        const fallbackOrders = settled.flatMap((result) => (
          result.status === 'fulfilled' && Array.isArray(result.value.data) ? result.value.data : []
        ));
        setOrders(fallbackOrders);
        setError('');
      } catch {
        setError('Failed to load platform orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    const active = orders.filter((order) => !['DELIVERED', 'CANCELLED'].includes(order.orderStatus)).length;
    const delivered = orders.filter((order) => order.orderStatus === 'DELIVERED').length;
    const revenue = orders
      .filter((order) => order.orderStatus !== 'CANCELLED')
      .reduce((sum, order) => sum + Number(order.finalAmount || 0), 0);

    return { total: orders.length, active, delivered, revenue };
  }, [orders]);

  const counts = useMemo(() => orders.reduce((acc, order) => {
    acc[order.orderStatus] = (acc[order.orderStatus] || 0) + 1;
    return acc;
  }, {}), [orders]);

  const filteredOrders = status === 'ALL'
    ? orders
    : orders.filter((order) => order.orderStatus === status);

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 3, md: 5 }, background: 'linear-gradient(180deg, rgba(255,247,242,0.9) 0%, #f7f8fb 340px, #f7f8fb 100%)' }}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, mb: 3, borderRadius: 4, color: '#fff', background: 'linear-gradient(135deg, #d9282f 0%, #ff4b1f 100%)', boxShadow: '0 22px 64px rgba(217,40,47,0.22)' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.18)' }}>
                <Inventory2OutlinedIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight={950}>All Orders</Typography>
                <Typography sx={{ opacity: 0.86 }}>Monitor every order across restaurants, payments, and delivery status.</Typography>
              </Box>
            </Stack>
            <Chip label={`${summary.total} total orders`} sx={{ alignSelf: { xs: 'flex-start', md: 'center' }, bgcolor: 'rgba(255,255,255,0.16)', color: '#fff', fontWeight: 900, borderRadius: 999 }} />
          </Stack>
        </Paper>

        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}><StatCard label="Total Orders" value={summary.total} accent="#d9282f" icon={<ReceiptLongOutlinedIcon />} /></Grid>
          <Grid item xs={12} sm={6} md={3}><StatCard label="Active Orders" value={summary.active} accent="#f97316" icon={<Inventory2OutlinedIcon />} /></Grid>
          <Grid item xs={12} sm={6} md={3}><StatCard label="Delivered" value={summary.delivered} accent="#16a34a" icon={<StorefrontOutlinedIcon />} /></Grid>
          <Grid item xs={12} sm={6} md={3}><StatCard label="Order Value" value={money(summary.revenue)} accent="#2563eb" icon={<PaymentsOutlinedIcon />} /></Grid>
        </Grid>

        <Paper elevation={0} sx={{ p: 1, mb: 3, borderRadius: 999, display: 'inline-flex', maxWidth: '100%', overflowX: 'auto', border: '1px solid rgba(20,24,35,0.08)' }}>
          <Tabs value={status} onChange={(_, v) => setStatus(v)} variant="scrollable" scrollButtons="auto" textColor="error" indicatorColor="error" sx={{ minHeight: 42, '& .MuiTabs-indicator': { display: 'none' }, '& .MuiTab-root': { minHeight: 42, borderRadius: 999, px: 2, fontWeight: 900 }, '& .Mui-selected': { bgcolor: 'rgba(217,40,47,0.1)' } }}>
            {Object.keys(STATUS_META).map((key) => (
              <Tab key={key} value={key} label={`${STATUS_META[key].label} (${key === 'ALL' ? orders.length : counts[key] || 0})`} />
            ))}
          </Tabs>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="error" />
          </Box>
        ) : filteredOrders.length === 0 ? (
          <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={900}>No orders found</Typography>
            <Typography color="text.secondary">Try another status filter.</Typography>
          </Paper>
        ) : (
          <Stack spacing={2.5}>
            {filteredOrders.map((order) => {
              const meta = STATUS_META[order.orderStatus] || STATUS_META.ALL;
              const charges = calculateOrderCharges(order.totalAmount, order.discountAmount);
              const displayTotal = order.finalAmount || charges.finalAmount;
              return (
                <Card key={order.orderId} sx={{ borderRadius: 4, border: '1px solid rgba(20,24,35,0.08)', boxShadow: '0 16px 48px rgba(24,28,42,0.08)' }}>
                  <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
                      <Box>
                        <Typography variant="h6" fontWeight={950}>Order #{order.orderId}</Typography>
                        <Typography variant="body2" color="text.secondary">{formatDate(order.orderDate)}</Typography>
                      </Box>
                      <Chip label={meta.label} color={meta.color} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, borderRadius: 999, fontWeight: 900, bgcolor: meta.bg, color: meta.fg }} />
                    </Stack>

                    <Grid container spacing={2} sx={{ mt: 1.5 }}>
                      <Grid item xs={12} sm={4}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <PersonIcon color="action" fontSize="small" />
                          <Typography variant="body2">Customer #{order.customerId}</Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <StorefrontOutlinedIcon color="action" fontSize="small" />
                          <Typography variant="body2">Restaurant #{order.restaurantId}</Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <PaymentsOutlinedIcon color="action" fontSize="small" />
                          <Typography variant="body2">{order.modeOfPayment || 'Payment'} - {money(displayTotal)}</Typography>
                        </Stack>
                      </Grid>
                    </Grid>

                    <Grid container spacing={1.25} sx={{ mt: 1 }}>
                      {[
                        ['Items', money(order.totalAmount)],
                        ['Discount', `- ${money(order.discountAmount)}`],
                        ['GST 5%', money(charges.gstAmount)],
                        ['Platform', money(charges.platformFee)],
                        ['Delivery', money(charges.deliveryCharge)],
                      ].map(([label, value]) => (
                        <Grid item xs={6} sm={2.4} key={label}>
                          <Paper elevation={0} sx={{ p: 1, borderRadius: 2.5, bgcolor: '#f8fafc', border: '1px solid rgba(20,24,35,0.06)' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={800}>{label}</Typography>
                            <Typography variant="body2" fontWeight={900}>{value}</Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>

                    <Paper elevation={0} sx={{ mt: 2, p: 1.5, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid rgba(20,24,35,0.06)' }}>
                      <Stack direction="row" spacing={1.25} alignItems="flex-start">
                        <LocationOnOutlinedIcon sx={{ color: '#ef4444', mt: 0.15 }} fontSize="small" />
                        <Typography variant="body2">{order.deliveryAddress || 'No delivery address provided'}</Typography>
                      </Stack>
                    </Paper>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default AllOrders;
