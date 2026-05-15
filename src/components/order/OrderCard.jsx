// src/components/order/OrderCard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Rating as MuiRating,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import DeliveryDiningOutlinedIcon from '@mui/icons-material/DeliveryDiningOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import orderApi from '../../api/orderApi';
import reviewApi from '../../api/reviewApi';
import AppSnackbar from '../common/AppSnackbar';
import ConfirmDialog from '../common/ConfirmDialog';
import { calculateOrderCharges, money } from '../../utils/orderCharges';

const STATUS_META = {
  PLACED: { label: 'Placed', color: '#f59e0b', bg: '#fff7ed' },
  CONFIRMED: { label: 'Confirmed', color: '#2563eb', bg: '#eff6ff' },
  PREPARING: { label: 'Preparing', color: '#7c3aed', bg: '#f5f3ff' },
  PICKED_UP: { label: 'On the way', color: '#0f766e', bg: '#f0fdfa' },
  DELIVERED: { label: 'Delivered', color: '#168039', bg: '#f0fdf4' },
  CANCELLED: { label: 'Cancelled', color: '#dc2626', bg: '#fef2f2' },
};

const OrderCard = ({ order, onRefresh }) => {
  const navigate = useNavigate();
  const [reviewed, setReviewed] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);
  const [foodRating, setFoodRating] = useState(5);
  const [delivRating, setDelivRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  useEffect(() => {
    if (order.orderStatus === 'DELIVERED') {
      reviewApi.getByOrder(order.orderId)
        .then(() => setReviewed(true))
        .catch(() => setReviewed(false));
    }
  }, [order.orderId, order.orderStatus]);

  const handleReorder = async (e) => {
    e.stopPropagation();
    try {
      await orderApi.reorder(order.orderId);
      setSnack({ open: true, msg: 'Order placed again!', severity: 'success' });
      onRefresh && onRefresh();
    } catch (err) {
      setSnack({ open: true, msg: err.response?.data?.message || 'Reorder failed', severity: 'error' });
    }
  };

  const handleCancel = async (e) => {
    e?.stopPropagation();
    try {
      await orderApi.cancelOrder(order.orderId);
      setCancelDialog(false);
      setSnack({ open: true, msg: 'Order cancelled successfully', severity: 'success' });
      onRefresh && onRefresh();
    } catch (err) {
      setSnack({ open: true, msg: err.response?.data?.message || 'Cannot cancel order at this stage', severity: 'error' });
    }
  };

  const handleRateOpen = (e) => {
    e.stopPropagation();
    setFoodRating(5);
    setDelivRating(5);
    setComment('');
    setRateOpen(true);
  };

  const handleRateSubmit = async () => {
    setSubmitting(true);
    try {
      await reviewApi.addReview({
        orderId: order.orderId,
        restaurantId: order.restaurantId,
        agentId: order.deliveryAgentId || order.agentId || null,
        foodRating,
        deliveryRating: delivRating,
        comment,
      });
      setReviewed(true);
      setRateOpen(false);
      setSnack({ open: true, msg: 'Review submitted! Thank you.', severity: 'success' });
      onRefresh && onRefresh();
    } catch (err) {
      setSnack({ open: true, msg: err.response?.data?.message || 'Failed to submit review', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const formattedDate = new Date(order.orderDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const status = STATUS_META[order.orderStatus] || STATUS_META.PLACED;
  const itemPreview = order.orderItems?.slice(0, 2).map((item) => `${item.name} x${item.quantity}`).join(', ');
  const charges = calculateOrderCharges(order.totalAmount, order.discountAmount);

  return (
    <>
      <Card
        onClick={() => navigate(`/orders/${order.orderId}`)}
        sx={{
          borderRadius: 4,
          cursor: 'pointer',
          overflow: 'hidden',
          border: '1px solid rgba(20,24,35,0.08)',
          boxShadow: '0 14px 42px rgba(24,28,42,0.08)',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 22px 56px rgba(24,28,42,0.13)',
            borderColor: 'rgba(217,40,47,0.18)',
          },
        }}
      >
        <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                color: status.color,
                bgcolor: status.bg,
                border: `1px solid ${status.color}22`,
              }}
            >
              {order.orderStatus === 'PICKED_UP' ? <DeliveryDiningOutlinedIcon /> : <ReceiptLongOutlinedIcon />}
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                <Typography variant="h6" fontWeight={900}>
                  Order #{order.orderId}
                </Typography>
                <Chip
                  label={status.label}
                  size="small"
                  sx={{
                    color: status.color,
                    bgcolor: status.bg,
                    border: `1px solid ${status.color}33`,
                    fontWeight: 900,
                    borderRadius: 999,
                  }}
                />
              </Stack>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <AccessTimeIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {formattedDate}
                </Typography>
              </Box>
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <RestaurantIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" noWrap>
                {itemPreview}
                {order.orderItems?.length > 2 && ` +${order.orderItems.length - 2} more`}
              </Typography>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} justifyContent="space-between">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {order.modeOfPayment}
                </Typography>
                <Typography variant="h6" fontWeight={900} color="error.main">
                  {money(order.finalAmount || charges.finalAmount)}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
                {order.orderStatus === 'DELIVERED' && reviewed && (
                  <Chip
                    icon={<StarIcon sx={{ fontSize: 14 }} />}
                    label="Reviewed"
                    size="small"
                    color="warning"
                    variant="outlined"
                    sx={{ borderRadius: 999, fontWeight: 800 }}
                  />
                )}

                {order.orderStatus === 'DELIVERED' && !reviewed && (
                  <Button
                    size="small"
                    color="warning"
                    variant="contained"
                    startIcon={<StarBorderIcon />}
                    onClick={handleRateOpen}
                    sx={{ borderRadius: 999 }}
                  >
                    Rate
                  </Button>
                )}

                {(order.orderStatus === 'PLACED' || order.orderStatus === 'CONFIRMED') && (
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    startIcon={<CancelOutlinedIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCancelDialog(true);
                    }}
                    sx={{ borderRadius: 999 }}
                  >
                    Cancel
                  </Button>
                )}

                {(order.orderStatus === 'DELIVERED' || order.orderStatus === 'CANCELLED') && (
                  <Button
                    size="small"
                    color="error"
                    variant="contained"
                    startIcon={<ReplayOutlinedIcon />}
                    onClick={handleReorder}
                    sx={{ borderRadius: 999 }}
                  >
                    Reorder
                  </Button>
                )}

                <Button
                  size="small"
                  color="inherit"
                  endIcon={<ArrowForwardRoundedIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/orders/${order.orderId}`);
                  }}
                  sx={{ borderRadius: 999, fontWeight: 900 }}
                >
                  Details
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Dialog
        open={rateOpen}
        onClose={() => !submitting && setRateOpen(false)}
        maxWidth="xs"
        fullWidth
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle sx={{ fontWeight: 900 }}>Rate Order #{order.orderId}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Your feedback helps restaurants improve.
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={900} gutterBottom>
              Food Quality
            </Typography>
            <MuiRating value={foodRating} onChange={(_, v) => setFoodRating(v || 1)} size="large" />
            <Typography variant="caption" color="text.secondary" display="block">
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][foodRating]}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={900} gutterBottom>
              Delivery Experience
            </Typography>
            <MuiRating value={delivRating} onChange={(_, v) => setDelivRating(v || 1)} size="large" />
            <Typography variant="caption" color="text.secondary" display="block">
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][delivRating]}
            </Typography>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Your comments (optional)"
            placeholder="Tell us what you liked or what could be better..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRateOpen(false)} disabled={submitting} sx={{ borderRadius: 999 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleRateSubmit}
            disabled={submitting}
            sx={{ borderRadius: 999 }}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={cancelDialog}
        title="Cancel Order?"
        message={`Are you sure you want to cancel order #${order.orderId}?`}
        confirmText="Cancel Order"
        onCancel={() => setCancelDialog(false)}
        onConfirm={handleCancel}
      />

      <AppSnackbar
        open={snack.open}
        message={snack.msg}
        severity={snack.severity}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      />
    </>
  );
};

export default OrderCard;
