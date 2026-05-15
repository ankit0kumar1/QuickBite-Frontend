// src/pages/Checkout.jsx
import React, { useState, useCallback } from 'react';
import { useNavigate }     from 'react-router-dom';
import {
  Box, Container, Typography, Paper,
  TextField, Button, Divider,
  RadioGroup, FormControlLabel, Radio,
  FormControl, Alert,
  CircularProgress, List, ListItem,
  ListItemText, Chip,
} from '@mui/material';
import ArrowBackIcon  from '@mui/icons-material/ArrowBack';
import PlaceIcon      from '@mui/icons-material/Place';
import MapIcon        from '@mui/icons-material/Map';
import EditIcon       from '@mui/icons-material/Edit';
import { useCart }    from '../context/CartContext';
import orderApi       from '../api/orderApi';
import LocationPicker from '../components/restaurant/LocationPicker';
import { calculateOrderCharges, money } from '../utils/orderCharges';

const PAYMENT_MODES = [
  { value: 'COD',    label: '💵 Cash on Delivery' },
  { value: 'UPI',    label: '📱 UPI' },
  { value: 'CARD',   label: '💳 Card' },
  { value: 'WALLET', label: '👛 Wallet' },
];

const Checkout = () => {
  const navigate        = useNavigate();
  const { cart, clearCart } = useCart();

  // Address state
  const [addressText,  setAddressText]  = useState('');  // final string sent to backend
  const [manualEntry,  setManualEntry]  = useState(false); // toggle between map vs manual text
  const [lat,          setLat]          = useState(null);
  const [lng,          setLng]          = useState(null);
  const [mapResolved,  setMapResolved]  = useState(false); // whether map gave us an address

  const [payment,      setPayment]      = useState('COD');
  const [instructions, setInstructions] = useState('');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const charges = calculateOrderCharges(cart?.totalPrice, cart?.discountAmount);

  // ── Called by LocationPicker when user picks a point ──────────────
  // MUST be above the conditional return to satisfy react-hooks/rules-of-hooks
  const handleLocationChange = useCallback(async (newLat, newLng) => {
    setLat(newLat);
    setLng(newLng);
    setMapResolved(false);

    // Reverse-geocode coordinates → human-readable address using Nominatim
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data?.display_name) {
        const a = data.address || {};
        const parts = [
          a.house_number && a.road
            ? `${a.house_number}, ${a.road}`
            : a.road || a.pedestrian || a.footway,
          a.suburb || a.neighbourhood,
          a.city || a.town || a.village || a.county,
          a.state,
          a.postcode,
        ].filter(Boolean);
        setAddressText(parts.join(', '));
        setMapResolved(true);
      }
    } catch {
      setAddressText(`${newLat.toFixed(6)}, ${newLng.toFixed(6)}`);
      setMapResolved(true);
    }
  }, []);

  // Redirect if cart is empty
  if (!cart || cart.items?.length === 0) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Your cart is empty
        </Typography>
        <Button variant="contained" color="error" sx={{ mt: 2 }} onClick={() => navigate('/home')}>
          Browse Restaurants
        </Button>
      </Container>
    );
  }

  // ── Place Order ───────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!addressText.trim()) {
      setError('Please pick a delivery location on the map or enter your address manually');
      return;
    }
    if (lat == null || lng == null) {
      setError('Please pin your delivery point on the map so the delivery agent can track it accurately.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const orderRequest = {
        restaurantId       : cart.restaurantId,
        items              : cart.items.map(i => ({
          menuItemId   : i.menuItemId,
          name         : i.name,
          price        : i.price,
          quantity     : i.quantity,
          customization: i.customization,
        })),
        totalAmount        : cart.totalPrice,
        discountAmount     : cart.discountAmount || 0,
        finalAmount        : charges.finalAmount,
        modeOfPayment      : payment,
        deliveryAddress    : addressText,
        deliveryLatitude   : lat,
        deliveryLongitude  : lng,
        specialInstructions: instructions,
        promoCode          : cart.promoCode,
      };

      const res = await orderApi.placeOrder(orderRequest);
      await clearCart();

      navigate('/payment', {
        state: {
          orderId: res.data.orderId,
          amount : charges.finalAmount,
          mode   : payment,
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to place order. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="sm">

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} color="inherit">
            Back
          </Button>
          <Typography variant="h5" fontWeight="bold">Checkout</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* ── Order Summary ── */}
        <Paper elevation={0} sx={{ borderRadius: 3, p: 3, mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Order Summary
          </Typography>
          <List dense disablePadding>
            {cart.items.map((item) => (
              <ListItem key={item.menuItemId} disablePadding sx={{ py: 0.5 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">{item.name} × {item.quantity}</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {money(item.subtotal)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 1.5 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">Subtotal</Typography>
            <Typography variant="body2">{money(charges.itemTotal)}</Typography>
          </Box>
          {cart.discountAmount > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" color="success.main">
                Discount ({cart.promoCode})
              </Typography>
              <Typography variant="body2" color="success.main">
                - {money(charges.discountAmount)}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">GST (5%)</Typography>
            <Typography variant="body2">{money(charges.gstAmount)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">Platform fee</Typography>
            <Typography variant="body2">{money(charges.platformFee)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">Delivery charge</Typography>
            <Typography variant="body2">{money(charges.deliveryCharge)}</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" fontWeight="bold">Total to Pay</Typography>
            <Typography variant="subtitle1" fontWeight="bold" color="error.main">
              {money(charges.finalAmount)}
            </Typography>
          </Box>
        </Paper>

        {/* ── Delivery Address ── */}
        <Paper elevation={0} sx={{ borderRadius: 3, p: 3, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PlaceIcon color="error" />
              <Typography variant="h6" fontWeight="bold">Delivery Address</Typography>
            </Box>
            <Button
              size="small"
              variant="text"
              startIcon={manualEntry ? <MapIcon /> : <EditIcon />}
              onClick={() => {
                setManualEntry(m => !m);
                setError('');
              }}
              sx={{ color: '#d32f2f', textTransform: 'none', fontSize: 13 }}
            >
              {manualEntry ? 'Use Map' : 'Type manually'}
            </Button>
          </Box>

          {/* Resolved address chip */}
          {mapResolved && !manualEntry && (
            <Box sx={{ mb: 1.5 }}>
              <Chip
                icon={<PlaceIcon />}
                label={addressText}
                color="success"
                variant="outlined"
                size="small"
                sx={{ height: 'auto', '& .MuiChip-label': { whiteSpace: 'normal', py: 0.5 } }}
              />
            </Box>
          )}

          {/* Map mode */}
          {!manualEntry && (
            <LocationPicker
              latitude={lat}
              longitude={lng}
              onLocationChange={handleLocationChange}
              address={addressText}
              label="Delivery Location"
            />
          )}

          {/* Manual text mode */}
          {manualEntry && (
            <TextField
              fullWidth
              multiline rows={3}
              placeholder="Enter your full delivery address (house no., street, city, pincode)…"
              value={addressText}
              onChange={e => setAddressText(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          )}

          {/* Address summary when map is used */}
          {!manualEntry && addressText && (
            <Box sx={{ mt: 1.5 }}>
              <Typography variant="caption" color="text.secondary">
                Delivery to:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {addressText}
              </Typography>
              <Button
                size="small" variant="text"
                sx={{ p: 0, mt: 0.5, color: '#d32f2f', textTransform: 'none', fontSize: 12 }}
                onClick={() => setManualEntry(true)}
              >
                Edit address manually
              </Button>
            </Box>
          )}
        </Paper>

        {/* ── Payment Mode ── */}
        <Paper elevation={0} sx={{ borderRadius: 3, p: 3, mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            💳 Payment Method
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup value={payment} onChange={e => setPayment(e.target.value)}>
              {PAYMENT_MODES.map(mode => (
                <FormControlLabel
                  key={mode.value} value={mode.value}
                  control={<Radio color="error" />}
                  label={mode.label}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Paper>

        {/* ── Special Instructions ── */}
        <Paper elevation={0} sx={{ borderRadius: 3, p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            📝 Special Instructions
          </Typography>
          <TextField
            fullWidth multiline rows={2}
            placeholder="Any special requests? (optional)"
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </Paper>

        {/* ── Place Order ── */}
        <Button
          fullWidth variant="contained" color="error"
          size="large" onClick={handlePlaceOrder} disabled={loading}
          sx={{ borderRadius: 2, py: 1.5, fontSize: 16 }}
        >
          {loading
            ? <CircularProgress size={24} color="inherit" />
            : `Place Order - ${money(charges.finalAmount)}`}
        </Button>

      </Container>
    </Box>
  );
};

export default Checkout;
