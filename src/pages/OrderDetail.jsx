// src/pages/OrderDetail.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeliveryDiningOutlinedIcon from '@mui/icons-material/DeliveryDiningOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import AppSnackbar from '../components/common/AppSnackbar';
import ConfirmDialog from '../components/common/ConfirmDialog';
import OrderStatusStepper from '../components/order/OrderStatusStepper';
import SubmitReviewDialog from '../components/review/SubmitReviewDialog';
import orderApi from '../api/orderApi';
import reviewApi from '../api/reviewApi';
import { calculateOrderCharges, money } from '../utils/orderCharges';

const STATUS_META = {
  PLACED: { label: 'Placed', color: '#f59e0b', bg: '#fff7ed' },
  CONFIRMED: { label: 'Confirmed', color: '#2563eb', bg: '#eff6ff' },
  PREPARING: { label: 'Preparing', color: '#7c3aed', bg: '#f5f3ff' },
  PICKED_UP: { label: 'On the way', color: '#0f766e', bg: '#f0fdfa' },
  DELIVERED: { label: 'Delivered', color: '#168039', bg: '#f0fdf4' },
  CANCELLED: { label: 'Cancelled', color: '#dc2626', bg: '#fef2f2' },
};

const cardSx = {
  borderRadius: 4,
  border: '1px solid rgba(20,24,35,0.08)',
  boxShadow: '0 16px 48px rgba(24,28,42,0.08)',
  background: '#fff',
};

const OrderDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isNewOrder = location.state?.newOrder;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewDialog, setReviewDialog] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const charges = calculateOrderCharges(order?.totalAmount, order?.discountAmount);

  useEffect(() => {
    fetchOrder();
    checkReviewed();
    const interval = setInterval(() => {
      fetchOrder(true);
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchOrder = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await orderApi.getOrderById(id);
      setOrder(res.data);
    } catch {
      setError('Order not found');
    } finally {
      setLoading(false);
    }
  };

  const checkReviewed = async () => {
    try {
      await reviewApi.getByOrder(id);
      setAlreadyReviewed(true);
    } catch {
      setAlreadyReviewed(false);
    }
  };

  const handleCancel = async () => {
    try {
      const res = await orderApi.cancelOrder(id);
      setOrder(res.data);
      setCancelDialog(false);
      setSnack({ open: true, message: 'Order cancelled successfully', severity: 'success' });
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || 'Cannot cancel order', severity: 'error' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress color="error" />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const status = STATUS_META[order.orderStatus] || STATUS_META.PLACED;
  const formattedDate = new Date(order.orderDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: { xs: 3, md: 5 },
        background:
          'linear-gradient(180deg, rgba(255,247,242,0.9) 0%, #f7f8fb 360px, #f7f8fb 100%)',
      }}
    >
      <Container maxWidth="md">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/orders')}
          color="inherit"
          sx={{ mb: 2, borderRadius: 999, fontWeight: 900 }}
        >
          My Orders
        </Button>

        {isNewOrder && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Order placed successfully! Your food is being prepared.
          </Alert>
        )}

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
            <Avatar
              sx={{
                width: 62,
                height: 62,
                bgcolor: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              <ReceiptLongOutlinedIcon fontSize="large" />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight={900}>
                Order #{order.orderId}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.88 }}>
                {formattedDate}
              </Typography>
            </Box>
            <Chip
              label={status.label}
              sx={{
                color: status.color,
                bgcolor: '#fff',
                fontWeight: 900,
                borderRadius: 999,
              }}
            />
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ ...cardSx, p: { xs: 2.5, md: 3 }, mb: 3 }}>
          <OrderStatusStepper status={order.orderStatus} />

          {(order.orderStatus === 'PLACED' || order.orderStatus === 'CONFIRMED') && (
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Button variant="outlined" color="error" size="small" onClick={() => setCancelDialog(true)} sx={{ borderRadius: 999 }}>
                Cancel Order
              </Button>
            </Box>
          )}
        </Paper>

        <Paper elevation={0} sx={{ ...cardSx, p: { xs: 2.5, md: 3 }, mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(217,40,47,0.1)', color: '#d9282f' }}>
              <RestaurantMenuOutlinedIcon />
            </Avatar>
            <Typography variant="h6" fontWeight={900}>
              Items Ordered
            </Typography>
          </Stack>

          <List dense disablePadding>
            {order.orderItems?.map((item) => (
              <ListItem key={item.orderItemId} disablePadding sx={{ py: 1 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body1" fontWeight={700}>
                        {item.name}
                        <Chip label={`x${item.quantity}`} size="small" sx={{ ml: 1, height: 22, fontWeight: 900 }} />
                      </Typography>
                      <Typography variant="body1" fontWeight={900}>
                        {money(item.subtotal)}
                      </Typography>
                    </Box>
                  }
                  secondary={item.customization}
                />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography variant="body2" color="text.secondary">
              Subtotal
            </Typography>
            <Typography variant="body2">{money(charges.itemTotal)}</Typography>
          </Box>

          {order.discountAmount > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
              <Typography variant="body2" color="success.main">
                Discount ({order.promoCode})
              </Typography>
              <Typography variant="body2" color="success.main">
                - {money(charges.discountAmount)}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography variant="body2" color="text.secondary">GST (5%)</Typography>
            <Typography variant="body2">{money(charges.gstAmount)}</Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography variant="body2" color="text.secondary">Platform fee</Typography>
            <Typography variant="body2">{money(charges.platformFee)}</Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography variant="body2" color="text.secondary">Delivery charge</Typography>
            <Typography variant="body2">{money(charges.deliveryCharge)}</Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight={900}>
              Total Paid
            </Typography>
            <Typography variant="h6" fontWeight={900} color="error.main">
              {money(order.finalAmount || charges.finalAmount)}
            </Typography>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ ...cardSx, p: { xs: 2.5, md: 3 }, mb: 3 }}>
          <Typography variant="h6" fontWeight={900} gutterBottom>
            Delivery Details
          </Typography>

          <Stack spacing={2}>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <LocationOnIcon color="action" sx={{ mt: 0.3 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Delivery Address
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {order.deliveryAddress}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <PaymentIcon color="action" sx={{ mt: 0.3 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Payment Method
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {order.modeOfPayment}
                </Typography>
              </Box>
            </Box>

            {order.specialInstructions && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Special Instructions
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {order.specialInstructions}
                </Typography>
              </Box>
            )}
          </Stack>
        </Paper>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<HomeOutlinedIcon />}
            onClick={() => navigate('/home')}
            sx={{ borderRadius: 999, minHeight: 48, fontWeight: 900 }}
          >
            Order More
          </Button>

          <Button
            fullWidth
            variant="contained"
            color="error"
            startIcon={<ReceiptLongOutlinedIcon />}
            onClick={() => navigate('/orders')}
            sx={{ borderRadius: 999, minHeight: 48, fontWeight: 900 }}
          >
            All Orders
          </Button>

          {order?.orderStatus !== 'DELIVERED' && order?.orderStatus !== 'CANCELLED' && (
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              startIcon={<DeliveryDiningOutlinedIcon />}
              onClick={() => navigate(`/delivery/track/${id}`)}
              sx={{ borderRadius: 999, minHeight: 48, fontWeight: 900 }}
            >
              Track Delivery
            </Button>
          )}

          {order?.orderStatus === 'DELIVERED' && (
            <Button
              fullWidth
              variant="contained"
              color="warning"
              disabled={alreadyReviewed}
              startIcon={<StarBorderOutlinedIcon />}
              onClick={() => setReviewDialog(true)}
              sx={{ borderRadius: 999, minHeight: 48, fontWeight: 900 }}
            >
              {alreadyReviewed ? 'Reviewed' : 'Rate & Review'}
            </Button>
          )}
        </Stack>

        {order && (
          <SubmitReviewDialog
            open={reviewDialog}
            onClose={() => setReviewDialog(false)}
            order={order}
            onSuccess={() => {
              setAlreadyReviewed(true);
              setSnack({ open: true, message: 'Thank you for your review!', severity: 'success' });
            }}
          />
        )}

        <ConfirmDialog
          open={cancelDialog}
          title="Cancel Order?"
          message="Are you sure you want to cancel this order? This action cannot be undone once confirmed."
          confirmText="Cancel Order"
          onCancel={() => setCancelDialog(false)}
          onConfirm={handleCancel}
        />

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

export default OrderDetail;
