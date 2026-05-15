// src/pages/Payment.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate }   from 'react-router-dom';
import {
  Box, Container, Typography, Paper,
  Button, Divider, CircularProgress,
  Alert, Chip,
} from '@mui/material';
import paymentApi from '../api/paymentApi';

const Payment = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  // Comes from Checkout page via navigation state
  const { orderId, amount, mode } =
    location.state || {};

  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [walletBal,   setWalletBal]   = useState(null);

  const fetchWalletBalance = useCallback(async () => {
    try {
      const res = await paymentApi.getWalletBalance();
      setWalletBal(res.data.data?.balance || 0);
    } catch {
      setWalletBal(0);
    }
  }, []);

  useEffect(() => {
    if (!orderId) navigate('/home');
    if (mode === 'WALLET') fetchWalletBalance();
  }, [fetchWalletBalance, mode, navigate, orderId]);

  const handleCOD = async () => {
    setLoading(true);
    setError('');
    try {
      await paymentApi.initiate({
        orderId,
        amount,
        mode: 'COD',
      });
      navigate(`/orders/${orderId}`,
        { state: { newOrder: true } });
    } catch (err) {
      setError(err.response?.data?.message ||
        'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleWallet = async () => {
    if (walletBal < amount) {
      setError(
        `Insufficient balance. ` +
        `Available: ₹${walletBal}, ` +
        `Required: ₹${amount}`
      );
      return;
    }
    setLoading(true);
    setError('');
    try {
      await paymentApi.payFromWallet({ orderId, amount });
      navigate(`/orders/${orderId}`,
        { state: { newOrder: true } });
    } catch (err) {
      setError(err.response?.data?.message ||
        'Wallet payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpay = async () => {
    setLoading(true);
    setError('');
    try {
      // Step 1: Create Razorpay order on backend
      const res = await paymentApi.initiate({
        orderId,
        amount,
        mode: 'RAZORPAY',
      });

      const {
        razorpayOrderId,
        amountInPaise,
        keyId,
      } = res.data.data;

      // Step 2: Open Razorpay checkout popup
      const options = {
        key            : keyId,
        amount         : amountInPaise,
        currency       : 'INR',
        name           : 'QuickBite',
        description    : `Order #${orderId}`,
        order_id       : razorpayOrderId,
        handler        : async (response) => {
          // Step 3: Verify payment on backend
          try {
            await paymentApi.verify({
              razorpayOrderId  :
                response.razorpay_order_id,
              razorpayPaymentId:
                response.razorpay_payment_id,
              razorpaySignature:
                response.razorpay_signature,
            });
            navigate(`/orders/${orderId}`,
              { state: { newOrder: true } });
          } catch {
            setError('Payment verification failed.');
            setLoading(false);
          }
        },
        prefill: {
          name : 'QuickBite Customer',
        },
        theme: { color: '#d32f2f' },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError('Payment cancelled.');
          },
        },
      };

      // Load Razorpay script dynamically
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const rzp = new window.Razorpay(options);
        rzp.open();
        setLoading(false);
      };
      script.onerror = () => {
        setError('Failed to load Razorpay. ' +
          'Check your internet connection.');
        setLoading(false);
      };
      document.body.appendChild(script);

    } catch (err) {
      setError(err.response?.data?.message ||
        'Failed to initiate payment');
      setLoading(false);
    }
  };

  const handlePay = () => {
    if (mode === 'COD')      handleCOD();
    else if (mode === 'WALLET') handleWallet();
    else                     handleRazorpay();
  };

  return (
    <Box sx={{ backgroundColor: '#f5f5f5',
               minHeight: '100vh', py: 4 }}>
      <Container maxWidth="sm">
        <Typography variant="h5"
                    fontWeight="bold" gutterBottom>
          💳 Complete Payment
        </Typography>

        <Paper elevation={0}
               sx={{ borderRadius: 3, p: 3, mb: 2 }}>

          {/* Order Summary */}
          <Typography variant="subtitle1"
                      fontWeight="bold" gutterBottom>
            Order #{orderId}
          </Typography>

          <Box sx={{ display: 'flex',
                     justifyContent: 'space-between',
                     mb: 1 }}>
            <Typography color="text.secondary">
              Payment Mode
            </Typography>
            <Chip label={mode}
                  color="error" size="small" />
          </Box>

          <Divider sx={{ my: 1.5 }} />

          <Box sx={{ display: 'flex',
                     justifyContent: 'space-between' }}>
            <Typography variant="subtitle1"
                        fontWeight="bold">
              Total
            </Typography>
            <Typography variant="subtitle1"
                        fontWeight="bold"
                        color="error.main">
              ₹{amount}
            </Typography>
          </Box>

          {/* Wallet Balance */}
          {mode === 'WALLET' && walletBal !== null && (
            <Box sx={{ mt: 2, p: 1.5,
                       bgcolor: '#e8f5e9',
                       borderRadius: 2 }}>
              <Typography variant="body2"
                          color="success.main">
                💰 Wallet Balance: ₹{walletBal}
              </Typography>
              {walletBal < amount && (
                <Typography variant="caption"
                            color="error">
                  Insufficient balance!
                  Please top up or choose another method.
                </Typography>
              )}
            </Box>
          )}
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          fullWidth
          variant="contained"
          color="error"
          size="large"
          onClick={handlePay}
          disabled={loading ||
            (mode === 'WALLET' &&
             walletBal !== null &&
             walletBal < amount)}
          sx={{ borderRadius: 2, py: 1.5 }}
        >
          {loading
            ? <CircularProgress size={24}
                                color="inherit" />
            : mode === 'COD'
              ? 'Confirm Cash on Delivery'
              : mode === 'WALLET'
                ? `Pay ₹${amount} from Wallet`
                : `Pay ₹${amount} via Razorpay`}
        </Button>

        <Button
          fullWidth
          color="inherit"
          sx={{ mt: 1 }}
          onClick={() => navigate(-1)}
        >
          ← Back to Checkout
        </Button>

      </Container>
    </Box>
  );
};

export default Payment;
