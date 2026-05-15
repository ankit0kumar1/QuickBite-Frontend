// src/pages/owner/IncomingOrders.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card,
  CardContent, Chip, Button, CircularProgress,
  Alert, Select, MenuItem, FormControl,
  Divider, Tabs, Tab,
} from '@mui/material';
import restaurantApi from '../../api/restaurantApi';
import orderApi      from '../../api/orderApi';
import AppSnackbar from '../../components/common/AppSnackbar';

const STATUS_FLOW = {
  PLACED    : { next: 'CONFIRMED',  label: 'Confirm Order',    color: 'warning' },
  CONFIRMED : { next: 'PREPARING',  label: 'Start Preparing',  color: 'info'    },
  PREPARING : { next: null,         label: 'Awaiting Agent',   color: 'primary' },
  PICKED_UP : { next: null,         label: 'Out for Delivery', color: 'success' },
  DELIVERED : { next: null,         label: 'Delivered',        color: 'success' },
  CANCELLED : { next: null,         label: 'Cancelled',        color: 'error'   },
};

const IncomingOrders = () => {
  const [restaurants,    setRestaurants]    = useState([]);
  const [selectedRestId, setSelectedRestId] = useState('');
  const [orders,         setOrders]         = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');
  const [tab,            setTab]            = useState(0);
  const [snack,          setSnack]          = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchMyRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestId) fetchOrders();
  }, [selectedRestId]);

  const fetchMyRestaurants = async () => {
    try {
      const res = await restaurantApi.getMyRestaurants();
      setRestaurants(res.data);
      if (res.data.length > 0) {
        setSelectedRestId(res.data[0].restaurantId);
      }
    } catch {
      setError('Failed to load restaurants');
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await orderApi
        .getOrdersByRestaurant(selectedRestId);
      setOrders(res.data);
    } catch {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await orderApi.updateStatus(orderId, status);
      setSnack({ open: true, message: 'Order status updated', severity: 'success' });
      fetchOrders();
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || 'Failed to update status', severity: 'error' });
    }
  };

  const activeOrders = orders.filter(o =>
    !['DELIVERED', 'CANCELLED'].includes(o.orderStatus)
  );
  const pastOrders = orders.filter(o =>
    ['DELIVERED', 'CANCELLED'].includes(o.orderStatus)
  );
  const displayOrders = tab === 0
    ? activeOrders : pastOrders;

  const formatDate = (date) =>
    new Date(date).toLocaleString('en-IN', {
      day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <Box sx={{ backgroundColor: '#f5f5f5',
               minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h5"
                    fontWeight="bold"
                    gutterBottom>
          📋 Incoming Orders
        </Typography>

        {/* Restaurant Selector */}
        {restaurants.length > 1 && (
          <FormControl size="small"
                       sx={{ mb: 3, minWidth: 250 }}>
            <Select
              value={selectedRestId}
              onChange={e =>
                setSelectedRestId(e.target.value)}
            >
              {restaurants.map(r => (
                <MenuItem key={r.restaurantId}
                          value={r.restaurantId}>
                  {r.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Tabs */}
        <Tabs value={tab}
              onChange={(_, v) => setTab(v)}
              textColor="error"
              indicatorColor="error"
              sx={{ mb: 3 }}>
          <Tab label={`Active (${activeOrders.length})`} />
          <Tab label={`Past (${pastOrders.length})`} />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex',
                     justifyContent: 'center', py: 8 }}>
            <CircularProgress color="error" />
          </Box>
        ) : displayOrders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6"
                        color="text.secondary">
              {tab === 0
                ? '🎉 No active orders right now'
                : '📦 No past orders'}
            </Typography>
          </Box>
        ) : (
          displayOrders.map(order => {
            const statusInfo =
              STATUS_FLOW[order.orderStatus];
            return (
              <Card key={order.orderId}
                    sx={{ mb: 2, borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start', mb: 1,
                  }}>
                    <Box>
                      <Typography variant="subtitle1"
                                  fontWeight="bold">
                        Order #{order.orderId}
                      </Typography>
                      <Typography variant="caption"
                                  color="text.secondary">
                        {formatDate(order.orderDate)}
                      </Typography>
                    </Box>
                    <Chip
                      label={order.orderStatus}
                      color={statusInfo.color}
                      size="small"
                    />
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  {/* Items */}
                  {order.orderItems?.map(item => (
                    <Box key={item.orderItemId}
                         sx={{ display: 'flex',
                               justifyContent: 'space-between',
                               py: 0.3 }}>
                      <Typography variant="body2">
                        {item.name} × {item.quantity}
                      </Typography>
                      <Typography variant="body2"
                                  fontWeight="bold">
                        ₹{item.subtotal?.toFixed(0)}
                      </Typography>
                    </Box>
                  ))}

                  <Divider sx={{ my: 1 }} />

                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <Box>
                      <Typography variant="body2"
                                  color="text.secondary">
                        {order.modeOfPayment}
                      </Typography>
                      <Typography variant="subtitle2"
                                  fontWeight="bold"
                                  color="error.main">
                        ₹{order.finalAmount?.toFixed(0)}
                      </Typography>
                      <Typography variant="caption"
                                  color="text.secondary">
                        📍 {order.deliveryAddress}
                      </Typography>
                    </Box>

                    {/* Status Action Button */}
                    {statusInfo.next && (
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        sx={{ borderRadius: 2 }}
                        onClick={() =>
                          handleUpdateStatus(
                            order.orderId,
                            statusInfo.next
                          )}
                      >
                        {statusInfo.label}
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })
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

export default IncomingOrders;
