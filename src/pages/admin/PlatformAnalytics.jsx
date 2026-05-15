// src/pages/admin/PlatformAnalytics.jsx
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
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import DeliveryDiningOutlinedIcon from '@mui/icons-material/DeliveryDiningOutlined';
import LocalDiningOutlinedIcon from '@mui/icons-material/LocalDiningOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import adminApi from '../../api/adminApi';
import deliveryApi from '../../api/deliveryApi';
import orderApi from '../../api/orderApi';
import restaurantApi from '../../api/restaurantApi';
import { AGENT_DELIVERY_PAYOUT, calculateOrderCharges } from '../../utils/orderCharges';

const STATUS_META = {
  PLACED: { label: 'Placed', color: '#f97316' },
  CONFIRMED: { label: 'Confirmed', color: '#2563eb' },
  PREPARING: { label: 'Preparing', color: '#0891b2' },
  PICKED_UP: { label: 'Picked up', color: '#4f46e5' },
  DELIVERED: { label: 'Delivered', color: '#16a34a' },
  CANCELLED: { label: 'Cancelled', color: '#dc2626' },
};

const money = (value) => `Rs ${Number(value || 0).toFixed(0)}`;

const safeData = (result) => (result.status === 'fulfilled' && Array.isArray(result.value.data)
  ? result.value.data
  : []);

const fetchOrdersWithFallback = async (restaurants) => {
  try {
    const res = await orderApi.getAllOrders();
    return { orders: Array.isArray(res.data) ? res.data : [], usedFallback: false };
  } catch {
    const settled = await Promise.allSettled(
      restaurants.map((restaurant) => orderApi.getOrdersByRestaurant(restaurant.restaurantId))
    );
    const orders = settled.flatMap((result) => (
      result.status === 'fulfilled' && Array.isArray(result.value.data) ? result.value.data : []
    ));
    return { orders, usedFallback: true };
  }
};

const topEntry = (items, getKey) => {
  const counts = items.reduce((acc, item) => {
    const key = getKey(item) || 'Unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const [name, count] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || ['-', 0];
  return { name, count, counts };
};

const StatCard = ({ title, value, subtitle, icon, accent }) => (
  <Card sx={{ height: '100%', borderRadius: 4, border: '1px solid rgba(20,24,35,0.08)', boxShadow: '0 16px 48px rgba(24,28,42,0.08)' }}>
    <CardContent sx={{ p: 2.5 }}>
      <Stack direction="row" justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={800}>{title}</Typography>
          <Typography variant="h4" fontWeight={950} sx={{ mt: 0.5 }}>{value}</Typography>
          {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
        </Box>
        <Avatar sx={{ bgcolor: accent, color: '#fff', width: 52, height: 52 }}>{icon}</Avatar>
      </Stack>
    </CardContent>
  </Card>
);

const BreakdownRow = ({ label, value, total, color }) => {
  const percent = total ? Math.round((value / total) * 100) : 0;
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
        <Typography variant="body2" fontWeight={800}>{label}</Typography>
        <Typography variant="body2" color="text.secondary">{value} ({percent}%)</Typography>
      </Stack>
      <LinearProgress variant="determinate" value={percent} sx={{ height: 9, borderRadius: 999, bgcolor: '#eef2f7', '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 999 } }} />
    </Box>
  );
};

const PlatformAnalytics = () => {
  const [data, setData] = useState({
    restaurants: [],
    orders: [],
    users: [],
    agents: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const [restaurantsRes, usersRes, agentsRes] = await Promise.allSettled([
        restaurantApi.getAll(),
        adminApi.getAllUsers(),
        deliveryApi.getAllAgents(),
      ]);

      const restaurants = safeData(restaurantsRes);
      const { orders, usedFallback } = await fetchOrdersWithFallback(restaurants);

      setData({
        restaurants,
        orders,
        users: safeData(usersRes),
        agents: safeData(agentsRes),
      });

      if ([restaurantsRes, usersRes, agentsRes].some((result) => result.status === 'rejected')) {
        setError('Some analytics sources could not be loaded, so the dashboard is showing available data.');
      } else if (usedFallback) {
        setError('');
      }
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const { restaurants, orders, users, agents } = data;
    const openRestaurants = restaurants.filter((restaurant) => restaurant.isOpen).length;
    const verifiedAgents = agents.filter((agent) => agent.isVerified).length;
    const activeOrders = orders.filter((order) => !['DELIVERED', 'CANCELLED'].includes(order.orderStatus)).length;
    const deliveredOrders = orders.filter((order) => order.orderStatus === 'DELIVERED').length;
    const cancelledOrders = orders.filter((order) => order.orderStatus === 'CANCELLED').length;
    const revenue = orders
      .filter((order) => order.orderStatus !== 'CANCELLED')
      .reduce((sum, order) => sum + Number(order.finalAmount || 0), 0);
    const chargeTotals = orders
      .filter((order) => order.orderStatus !== 'CANCELLED')
      .reduce((acc, order) => {
        const charges = calculateOrderCharges(order.totalAmount, order.discountAmount);
        acc.gst += charges.gstAmount;
        acc.platform += charges.platformFee;
        acc.delivery += charges.deliveryCharge;
        return acc;
      }, { gst: 0, platform: 0, delivery: 0 });
    const avgOrderValue = orders.length ? revenue / orders.filter((order) => order.orderStatus !== 'CANCELLED').length || 0 : 0;
    const cuisine = topEntry(restaurants, (restaurant) => restaurant.cuisine);
    const payments = topEntry(orders, (order) => order.modeOfPayment);
    const statuses = orders.reduce((acc, order) => {
      acc[order.orderStatus] = (acc[order.orderStatus] || 0) + 1;
      return acc;
    }, {});

    return {
      totalRestaurants: restaurants.length,
      openRestaurants,
      totalOrders: orders.length,
      activeOrders,
      deliveredOrders,
      cancelledOrders,
      revenue,
      gstCollected: chargeTotals.gst,
      platformFees: chargeTotals.platform,
      deliveryPayout: deliveredOrders * AGENT_DELIVERY_PAYOUT,
      avgOrderValue,
      totalUsers: users.length,
      totalAgents: agents.length,
      verifiedAgents,
      cuisine,
      payments,
      statuses,
    };
  }, [data]);

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 3, md: 5 }, background: 'linear-gradient(180deg, rgba(255,247,242,0.9) 0%, #f7f8fb 340px, #f7f8fb 100%)' }}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, mb: 3, borderRadius: 4, color: '#fff', background: 'linear-gradient(135deg, #d9282f 0%, #ff4b1f 100%)', boxShadow: '0 22px 64px rgba(217,40,47,0.22)' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.18)' }}>
                <AnalyticsOutlinedIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight={950}>Platform Analytics</Typography>
                <Typography sx={{ opacity: 0.86 }}>Track orders, revenue, restaurant coverage, users, and delivery capacity.</Typography>
              </Box>
            </Stack>
            <Chip label="Live overview" sx={{ alignSelf: { xs: 'flex-start', md: 'center' }, bgcolor: 'rgba(255,255,255,0.16)', color: '#fff', fontWeight: 900, borderRadius: 999 }} />
          </Stack>
        </Paper>

        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="error" />
          </Box>
        ) : (
          <>
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Total Revenue" value={money(stats.revenue)} subtitle={`${money(stats.avgOrderValue)} avg order`} accent="#16a34a" icon={<PaymentsOutlinedIcon />} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Orders" value={stats.totalOrders} subtitle={`${stats.activeOrders} active now`} accent="#d9282f" icon={<ReceiptLongOutlinedIcon />} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Restaurants" value={stats.totalRestaurants} subtitle={`${stats.openRestaurants} open now`} accent="#f97316" icon={<RestaurantOutlinedIcon />} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Users" value={stats.totalUsers} subtitle={`${stats.verifiedAgents}/${stats.totalAgents} agents verified`} accent="#2563eb" icon={<PeopleAltOutlinedIcon />} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="GST Collected" value={money(stats.gstCollected)} subtitle="5% on discounted items" accent="#7c3aed" icon={<ReceiptLongOutlinedIcon />} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Platform Fees" value={money(stats.platformFees)} subtitle="Rs 5 per paid order" accent="#0f766e" icon={<AnalyticsOutlinedIcon />} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Agent Payout" value={money(stats.deliveryPayout)} subtitle={`Rs ${AGENT_DELIVERY_PAYOUT} per delivered order`} accent="#ea580c" icon={<DeliveryDiningOutlinedIcon />} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Cancelled" value={stats.cancelledOrders} subtitle="Excluded from revenue" accent="#dc2626" icon={<TrendingUpOutlinedIcon />} />
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(20,24,35,0.08)', height: '100%', boxShadow: '0 16px 48px rgba(24,28,42,0.08)' }}>
                  <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2.5 }}>
                    <Avatar sx={{ bgcolor: '#fff7ed', color: '#ea580c' }}><TrendingUpOutlinedIcon /></Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={950}>Order Health</Typography>
                      <Typography variant="body2" color="text.secondary">Status mix across the platform</Typography>
                    </Box>
                  </Stack>
                  <Stack spacing={2.25}>
                    {Object.entries(STATUS_META).map(([key, meta]) => (
                      <BreakdownRow key={key} label={meta.label} value={stats.statuses[key] || 0} total={stats.totalOrders} color={meta.color} />
                    ))}
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={5}>
                <Stack spacing={3}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(20,24,35,0.08)', boxShadow: '0 16px 48px rgba(24,28,42,0.08)' }}>
                    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#f0fdf4', color: '#15803d' }}><LocalDiningOutlinedIcon /></Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={950}>Top Cuisine</Typography>
                        <Typography variant="body2" color="text.secondary">{stats.cuisine.count} restaurants</Typography>
                      </Box>
                    </Stack>
                    <Typography variant="h4" fontWeight={950}>{stats.cuisine.name}</Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
                      {Object.entries(stats.cuisine.counts).slice(0, 6).map(([name, count]) => (
                        <Chip key={name} label={`${name} (${count})`} sx={{ borderRadius: 999, fontWeight: 800 }} />
                      ))}
                    </Stack>
                  </Paper>

                  <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(20,24,35,0.08)', boxShadow: '0 16px 48px rgba(24,28,42,0.08)' }}>
                    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#eff6ff', color: '#2563eb' }}><DeliveryDiningOutlinedIcon /></Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={950}>Delivery Network</Typography>
                        <Typography variant="body2" color="text.secondary">Agent readiness and completed work</Typography>
                      </Box>
                    </Stack>
                    <Grid container spacing={1.5}>
                      <Grid item xs={6}>
                        <Paper elevation={0} sx={{ p: 1.5, borderRadius: 3, bgcolor: '#f8fafc' }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={800}>Verified</Typography>
                          <Typography variant="h5" fontWeight={950}>{stats.verifiedAgents}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper elevation={0} sx={{ p: 1.5, borderRadius: 3, bgcolor: '#f8fafc' }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={800}>Delivered</Typography>
                          <Typography variant="h5" fontWeight={950}>{stats.deliveredOrders}</Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                    <Chip icon={<VerifiedOutlinedIcon />} label={`${stats.cancelledOrders} cancelled orders`} color="error" variant="outlined" sx={{ mt: 2, borderRadius: 999, fontWeight: 900 }} />
                  </Paper>
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(20,24,35,0.08)', boxShadow: '0 16px 48px rgba(24,28,42,0.08)' }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                    <Box>
                      <Typography variant="h6" fontWeight={950}>Payments Snapshot</Typography>
                      <Typography variant="body2" color="text.secondary">Most used payment mode: {stats.payments.name}</Typography>
                    </Box>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {Object.entries(stats.payments.counts).map(([name, count]) => (
                        <Chip key={name} label={`${name}: ${count}`} sx={{ borderRadius: 999, fontWeight: 900, bgcolor: '#fff7ed', color: '#c2410c' }} />
                      ))}
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
};

export default PlatformAnalytics;
