// src/pages/Wallet.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper,
  Button, TextField, Divider,
  CircularProgress, Alert, Chip,
  Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
} from '@mui/material';
import AccountBalanceWalletIcon
  from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import paymentApi from '../api/paymentApi';

const TYPE_COLOR = {
  CREDIT : 'success',
  DEBIT  : 'error',
  REFUND : 'info',
};

const Wallet = () => {
  const [balance,    setBalance]    = useState(null);
  const [statements, setStatements] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [topupAmt,   setTopupAmt]   = useState('');
  const [topupLoading, setTopupLoading] = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');

  useEffect(() => { fetchWalletData(); }, []);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const [balRes, stmtRes] = await Promise.all([
        paymentApi.getWalletBalance(),
        paymentApi.getWalletStatements(),
      ]);
      setBalance(balRes.data.data?.balance ?? 0);
      setStatements(stmtRes.data.data || []);
    } catch {
      setError('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async () => {
    const amount = parseFloat(topupAmt);
    if (!amount || amount < 1) {
      setError('Enter a valid amount (min ₹1)');
      return;
    }

    setError('');
    setTopupLoading(true);

    try {
      // Step 1: Create Razorpay order for topup
      const res = await paymentApi.initiateTopUp({
        amount,
        currency: 'INR',
      });

      const {
        razorpayOrderId,
        amountInPaise,
        keyId,
      } = res.data.data;

      // Step 2: Open Razorpay checkout
      const script = document.createElement('script');
      script.src =
        'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key        : keyId,
          amount     : amountInPaise,
          currency   : 'INR',
          name       : 'QuickBite Wallet',
          description: `Add ₹${amount} to wallet`,
          order_id   : razorpayOrderId,
          handler    : async (response) => {
            try {
              await paymentApi.verifyTopUp({
                amount,
                razorpayOrderId  :
                  response.razorpay_order_id,
                razorpayPaymentId:
                  response.razorpay_payment_id,
                razorpaySignature:
                  response.razorpay_signature,
              });
              setSuccess(
                `₹${amount} added to wallet!`);
              setTopupAmt('');
              fetchWalletData();
            } catch {
              setError('Top-up verification failed');
            }
            setTopupLoading(false);
          },
          theme  : { color: '#d32f2f' },
          modal  : {
            ondismiss: () => setTopupLoading(false),
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);

    } catch (err) {
      setError(err.response?.data?.message ||
        'Failed to initiate top-up');
      setTopupLoading(false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleString('en-IN', {
      day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <Box sx={{ backgroundColor: '#f5f5f5',
               minHeight: '100vh', py: 4 }}>
      <Container maxWidth="sm">

        <Typography variant="h5"
                    fontWeight="bold" gutterBottom>
          💰 My Wallet
        </Typography>

        {/* Balance Card */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3, p: 3, mb: 2,
            background  :
              'linear-gradient(135deg, #d32f2f, #b71c1c)',
            color: 'white',
          }}
        >
          <Box sx={{ display: 'flex',
                     alignItems: 'center', gap: 1,
                     mb: 1 }}>
            <AccountBalanceWalletIcon />
            <Typography variant="body2">
              Wallet Balance
            </Typography>
          </Box>

          {loading ? (
            <CircularProgress
              color="inherit" size={30} />
          ) : (
            <Typography variant="h3"
                        fontWeight="bold">
              ₹{balance?.toFixed(2) ?? '0.00'}
            </Typography>
          )}
        </Paper>

        {/* Add Money */}
        <Paper elevation={0}
               sx={{ borderRadius: 3, p: 3, mb: 2 }}>
          <Typography variant="h6"
                      fontWeight="bold" gutterBottom>
            Add Money
          </Typography>

          {error && (
            <Alert severity="error"
                   sx={{ mb: 1 }}
                   onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success"
                   sx={{ mb: 1 }}
                   onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {/* Quick amounts */}
          <Box sx={{ display: 'flex',
                     gap: 1, mb: 2,
                     flexWrap: 'wrap' }}>
            {[100, 200, 500, 1000].map(amt => (
              <Chip
                key={amt}
                label={`₹${amt}`}
                onClick={() =>
                  setTopupAmt(String(amt))}
                color={topupAmt === String(amt)
                  ? 'error' : 'default'}
                variant={topupAmt === String(amt)
                  ? 'filled' : 'outlined'}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              type="number"
              placeholder="Enter amount"
              value={topupAmt}
              onChange={(e) =>
                setTopupAmt(e.target.value)}
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment:
                  <Box sx={{ mr: 0.5 }}>₹</Box>,
              }}
            />
            <Button
              variant="contained"
              color="error"
              startIcon={<AddIcon />}
              onClick={handleTopUp}
              disabled={topupLoading}
              sx={{ borderRadius: 2 }}
            >
              {topupLoading ? '...' : 'Add'}
            </Button>
          </Box>
        </Paper>

        {/* Transaction History */}
        <Paper elevation={0}
               sx={{ borderRadius: 3, p: 3 }}>
          <Typography variant="h6"
                      fontWeight="bold" gutterBottom>
            Transaction History
          </Typography>

          {statements.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                No transactions yet
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">
                      Amount
                    </TableCell>
                    <TableCell align="right">
                      Balance
                    </TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {statements.map(stmt => (
                    <TableRow key={stmt.statementId}>
                      <TableCell>
                        <Box sx={{ display: 'flex',
                                   alignItems: 'center',
                                   gap: 0.5 }}>
                          <Chip
                            label={stmt.type}
                            size="small"
                            color={
                              TYPE_COLOR[stmt.type]
                              || 'default'}
                            sx={{ height: 18,
                                  fontSize: 10 }}
                          />
                          <Typography variant="caption">
                            {stmt.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color={
                            stmt.type === 'DEBIT'
                              ? 'error.main'
                              : 'success.main'
                          }
                        >
                          {stmt.type === 'DEBIT'
                            ? '-' : '+'}
                          ₹{stmt.amount}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="caption">
                          ₹{stmt.balanceAfter}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption"
                                    color="text.secondary">
                          {formatDate(stmt.createdAt)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Wallet;