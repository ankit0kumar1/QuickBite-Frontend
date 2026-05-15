// src/pages/owner/EarningsAnalytics.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper, Grid,
  CircularProgress, Alert, Card, CardContent,
  Select, MenuItem, FormControl, InputLabel,
  Divider,
} from '@mui/material';
import restaurantApi from '../../api/restaurantApi';
import orderApi      from '../../api/orderApi';

const StatBox = ({ label, value, icon, color }) => (
  <Card sx={{ borderRadius: 3 }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
          <Typography variant="h4" fontWeight="bold" color={color || 'text.primary'}>
            {value}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: 40 }}>{icon}</Typography>
      </Box>
    </CardContent>
  </Card>
);

const EarningsAnalytics = () => {
  const [restaurants,    setRestaurants]    = useState([]);
  const [selectedRestId, setSelectedRestId] = useState('');
  const [orders,         setOrders]         = useState([]);
  const [analytics,      setAnalytics]      = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');

  useEffect(() => { fetchMyRestaurants(); }, []);
  useEffect(() => {
    if (selectedRestId) {
      fetchOrders();
      fetchAnalytics();
    }
  }, [selectedRestId]);

  const fetchMyRestaurants = async () => {
    try {
      const res = await restaurantApi.getMyRestaurants();
      setRestaurants(res.data);
      if (res.data.length > 0) setSelectedRestId(res.data[0].restaurantId);
    } catch {
      setError('Failed to load restaurants');
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getOrdersByRestaurant(selectedRestId);
      setOrders(res.data);
    } catch {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await restaurantApi.getAnalytics(selectedRestId);
      setAnalytics(res.data);
    } catch {
      // Analytics endpoint may not be available yet
    }
  };

  // Compute from orders
  const delivered = orders.filter(o => o.orderStatus === 'DELIVERED');
  const cancelled = orders.filter(o => o.orderStatus === 'CANCELLED');
  const totalRevenue = delivered.reduce((s, o) => s + (o.finalAmount || 0), 0);
  const avgOrderVal  = delivered.length
    ? (totalRevenue / delivered.length).toFixed(0)
    : 0;

  // Top items
  const itemCount = {};
  delivered.forEach(o => {
    (o.orderItems || []).forEach(i => {
      itemCount[i.name] = (itemCount[i.name] || 0) + i.quantity;
    });
  });
  const topItems = Object.entries(itemCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          📊 Earnings & Analytics
        </Typography>

        {/* Restaurant Selector */}
        {restaurants.length > 1 && (
          <FormControl size="small" sx={{ mb: 3, minWidth: 250 }}>
            <InputLabel>Restaurant</InputLabel>
            <Select
              value={selectedRestId}
              label="Restaurant"
              onChange={e => setSelectedRestId(e.target.value)}
            >
              {restaurants.map(r => (
                <MenuItem key={r.restaurantId} value={r.restaurantId}>
                  {r.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="error" />
          </Box>
        ) : (
          <>
            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatBox label="Total Orders" value={orders.length} icon="📦" color="text.primary" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatBox label="Completed Orders" value={delivered.length} icon="✅" color="success.main" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatBox label="Total Revenue" value={`₹${totalRevenue.toFixed(0)}`} icon="💰" color="error.main" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatBox label="Avg Order Value" value={`₹${avgOrderVal}`} icon="📈" color="primary.main" />
              </Grid>
            </Grid>

            {/* Rating from analytics */}
            {analytics && (
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatBox label="Avg Rating" value={analytics.avgRating?.toFixed(1)} icon="⭐" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatBox label="Cancelled Orders" value={cancelled.length} icon="❌" color="warning.main" />
                </Grid>
              </Grid>
            )}

            {/* Top Selling Items */}
            {topItems.length > 0 && (
              <Paper elevation={0} sx={{ borderRadius: 3, p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  🔥 Top Selling Items
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {topItems.map(([name, qty], i) => (
                  <Box key={name} sx={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', py: 1,
                    borderBottom: i < topItems.length - 1 ? '1px solid #eee' : 'none',
                  }}>
                    <Typography variant="body1">
                      {i + 1}. {name}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="error.main">
                      {qty} orders
                    </Typography>
                  </Box>
                ))}
              </Paper>
            )}

            {orders.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  No orders yet for this restaurant
                </Typography>
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default EarningsAnalytics;
