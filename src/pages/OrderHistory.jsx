// src/pages/OrderHistory.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import OrderCard from '../components/order/OrderCard';
import orderApi from '../api/orderApi';

const OrderHistory = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await orderApi.getMyOrders();
      setOrders(res.data);
    } catch {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const activeOrders = orders.filter((order) =>
    !['DELIVERED', 'CANCELLED'].includes(order.orderStatus)
  );

  const pastOrders = orders.filter((order) =>
    ['DELIVERED', 'CANCELLED'].includes(order.orderStatus)
  );

  const displayOrders = activeTab === 0 ? activeOrders : pastOrders;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, rgba(255,247,242,0.9) 0%, #f7f8fb 340px, #f7f8fb 100%)',
      }}
    >
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 4 },
            mb: 3,
            borderRadius: 4,
            color: '#fff',
            background: 'linear-gradient(135deg, #d9282f 0%, #ff4b1f 100%)',
            boxShadow: '0 20px 60px rgba(217,40,47,0.24)',
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <Box
              sx={{
                width: 58,
                height: 58,
                display: 'grid',
                placeItems: 'center',
                borderRadius: '18px',
                bgcolor: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              <ReceiptLongOutlinedIcon fontSize="large" />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight={900}>
                My Orders
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.88 }}>
                Track active orders and quickly reorder your favorites.
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => navigate('/home')}
              startIcon={<ShoppingBagOutlinedIcon />}
              sx={{
                bgcolor: '#fff',
                color: '#d9282f',
                borderRadius: 999,
                px: 2.25,
                fontWeight: 900,
                '&:hover': { bgcolor: '#fff7f4' },
              }}
            >
              Order Now
            </Button>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 1,
            mb: 3,
            borderRadius: 999,
            display: 'inline-flex',
            border: '1px solid rgba(20,24,35,0.08)',
            boxShadow: '0 12px 34px rgba(24,28,42,0.06)',
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            textColor="error"
            indicatorColor="error"
            sx={{
              minHeight: 42,
              '& .MuiTabs-indicator': { display: 'none' },
              '& .MuiTab-root': {
                minHeight: 42,
                borderRadius: 999,
                px: 2.5,
                fontWeight: 900,
              },
              '& .Mui-selected': {
                bgcolor: 'rgba(217,40,47,0.1)',
              },
            }}
          >
            <Tab label={`Active (${activeOrders.length})`} />
            <Tab label={`Past (${pastOrders.length})`} />
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
        ) : displayOrders.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              textAlign: 'center',
              py: 7,
              px: 3,
              borderRadius: 4,
              border: '1px solid rgba(20,24,35,0.08)',
            }}
          >
            <Typography variant="h6" fontWeight={900}>
              {activeTab === 0 ? 'No active orders' : 'No past orders yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Fresh food is only a few taps away.
            </Typography>
            <Button
              variant="contained"
              color="error"
              sx={{ mt: 2, borderRadius: 999 }}
              onClick={() => navigate('/home')}
            >
              Order Now
            </Button>
          </Paper>
        ) : (
          <Stack spacing={2.25}>
            {displayOrders.map((order) => (
              <OrderCard key={order.orderId} order={order} onRefresh={fetchOrders} />
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default OrderHistory;
