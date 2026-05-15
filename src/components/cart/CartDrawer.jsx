// src/components/cart/CartDrawer.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CloseIcon from '@mui/icons-material/Close';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ShoppingCartCheckoutRoundedIcon from '@mui/icons-material/ShoppingCartCheckoutRounded';
import restaurantApi from '../../api/restaurantApi';
import { useCart } from '../../context/CartContext';
import { calculateOrderCharges, money } from '../../utils/orderCharges';
import CartItemComponent from './CartItem';

const CartDrawer = () => {
  const navigate = useNavigate();
  const {
    cart,
    loading,
    drawerOpen,
    setDrawerOpen,
    clearCart,
    applyPromo,
  } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState('');
  const [restaurantName, setRestaurantName] = useState('');

  useEffect(() => {
    let active = true;

    const fetchRestaurantName = async () => {
      if (!drawerOpen || !cart?.restaurantId) {
        setRestaurantName('');
        return;
      }

      try {
        const res = await restaurantApi.getById(cart.restaurantId);
        if (active) {
          setRestaurantName(res.data?.name || '');
        }
      } catch {
        if (active) {
          setRestaurantName('');
        }
      }
    };

    fetchRestaurantName();

    return () => {
      active = false;
    };
  }, [drawerOpen, cart?.restaurantId]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoError('');
    setPromoSuccess('');
    setPromoLoading(true);
    try {
      const updated = await applyPromo(promoCode.trim());
      setPromoSuccess(`Saved Rs ${updated.discountAmount?.toFixed(0)}!`);
    } catch (err) {
      setPromoError(err.response?.data?.message || 'Invalid promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleCheckout = () => {
    setDrawerOpen(false);
    navigate('/checkout');
  };

  const isEmpty = !cart?.items || cart.items.length === 0;
  const charges = calculateOrderCharges(cart?.totalPrice, cart?.discountAmount);

  return (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 430 },
          borderRadius: { xs: 0, sm: '28px 0 0 28px' },
          overflow: 'hidden',
          bgcolor: '#f7f8fb',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box
          sx={{
            p: 2.5,
            color: '#fff',
            background: 'linear-gradient(135deg, #d9282f 0%, #ff4b1f 100%)',
            boxShadow: '0 16px 44px rgba(217,40,47,0.24)',
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff' }}>
                <ShoppingCartIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={900}>
                  Your Cart
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.86 }}>
                  {isEmpty ? 'Ready for something tasty?' : `${cart.totalItems} item${cart.totalItems === 1 ? '' : 's'} ready`}
                </Typography>
              </Box>
            </Stack>

            <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.14)' }}>
              <CloseIcon />
            </IconButton>
          </Stack>

          {!isEmpty && (
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Chip
                icon={<RestaurantOutlinedIcon />}
                label={restaurantName || `Restaurant #${cart.restaurantId}`}
                sx={{ bgcolor: '#fff', color: '#d9282f', fontWeight: 900 }}
              />
              <Chip
                label={money(charges.finalAmount)}
                sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 900 }}
              />
            </Stack>
          )}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress color="error" />
          </Box>
        ) : isEmpty ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              p: 4,
              textAlign: 'center',
            }}
          >
            <Avatar sx={{ width: 82, height: 82, mb: 2, bgcolor: '#fff', color: '#d9282f', boxShadow: '0 14px 34px rgba(24,28,42,0.1)' }}>
              <ShoppingCartCheckoutRoundedIcon fontSize="large" />
            </Avatar>
            <Typography variant="h6" fontWeight={900}>
              Your cart is empty
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
              Add dishes from a restaurant and they will appear here.
            </Typography>
            <Button
              variant="contained"
              color="error"
              endIcon={<ArrowForwardRoundedIcon />}
              onClick={() => {
                setDrawerOpen(false);
                navigate('/home');
              }}
              sx={{ borderRadius: 999, fontWeight: 900 }}
            >
              Browse Restaurants
            </Button>
          </Box>
        ) : (
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            <Stack spacing={1.5}>
              {cart.items.map((item) => (
                <CartItemComponent key={item.menuItemId} item={item} />
              ))}
            </Stack>

            <Button
              color="error"
              startIcon={<DeleteSweepOutlinedIcon />}
              onClick={clearCart}
              sx={{ mt: 2, mb: 2, borderRadius: 999, fontWeight: 900 }}
            >
              Clear Cart
            </Button>

            <Box
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 3,
                bgcolor: '#fff',
                border: '1px solid rgba(20,24,35,0.08)',
                boxShadow: '0 10px 26px rgba(24,28,42,0.05)',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <LocalOfferIcon sx={{ color: '#d9282f' }} />
                <Typography variant="subtitle1" fontWeight={900}>
                  Promo Code
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  placeholder="Enter code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  disabled={!!cart.promoCode}
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      bgcolor: '#fbfcff',
                    },
                  }}
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleApplyPromo}
                  disabled={promoLoading || !!cart.promoCode}
                  sx={{ borderRadius: 2.5, fontWeight: 900, px: 2 }}
                >
                  {promoLoading ? '...' : 'Apply'}
                </Button>
              </Stack>

              {promoError && <Alert severity="error" sx={{ mt: 1.5 }}>{promoError}</Alert>}
              {promoSuccess && <Alert severity="success" sx={{ mt: 1.5 }}>{promoSuccess}</Alert>}

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Try WELCOME10, FLAT50, or SAVE20
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: '#fff',
                border: '1px solid rgba(20,24,35,0.08)',
                boxShadow: '0 10px 26px rgba(24,28,42,0.05)',
              }}
            >
              <Stack spacing={1.25}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Subtotal</Typography>
                  <Typography fontWeight={800}>{money(charges.itemTotal)}</Typography>
                </Stack>

                {cart.discountAmount > 0 && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="success.main">Discount ({cart.promoCode})</Typography>
                    <Typography color="success.main" fontWeight={800}>- {money(charges.discountAmount)}</Typography>
                  </Stack>
                )}

                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">GST (5%)</Typography>
                  <Typography fontWeight={800}>{money(charges.gstAmount)}</Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Platform fee</Typography>
                  <Typography fontWeight={800}>{money(charges.platformFee)}</Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Delivery charge</Typography>
                  <Typography fontWeight={800}>{money(charges.deliveryCharge)}</Typography>
                </Stack>

                <Divider />

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h6" fontWeight={900}>Total</Typography>
                  <Typography variant="h6" fontWeight={900} color="error.main">{money(charges.finalAmount)}</Typography>
                </Stack>
              </Stack>
            </Box>
          </Box>
        )}

        {!isEmpty && (
          <Box sx={{ p: 2, borderTop: '1px solid rgba(20,24,35,0.08)', bgcolor: '#fff' }}>
            <Button
              fullWidth
              variant="contained"
              color="error"
              size="large"
              onClick={handleCheckout}
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{ borderRadius: 999, minHeight: 54, fontWeight: 900 }}
            >
              Proceed to Checkout
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default CartDrawer;
