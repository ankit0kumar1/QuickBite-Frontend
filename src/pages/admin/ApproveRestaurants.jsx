// src/pages/admin/ApproveRestaurants.jsx
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import restaurantApi from '../../api/restaurantApi';
import AppSnackbar from '../../components/common/AppSnackbar';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const cardSx = {
  borderRadius: 4,
  height: '100%',
  border: '1px solid rgba(20,24,35,0.08)',
  boxShadow: '0 16px 48px rgba(24,28,42,0.08)',
  overflow: 'hidden',
};

const ApproveRestaurants = () => {
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pendRes, appRes] = await Promise.all([
        restaurantApi.getPending(),
        restaurantApi.getAll(),
      ]);
      setPending(pendRes.data);
      setApproved(appRes.data);
    } catch {
      setError('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await restaurantApi.approve(id);
      setSnack({ open: true, msg: 'Restaurant approved!', severity: 'success' });
      fetchAll();
    } catch {
      setSnack({ open: true, msg: 'Failed to approve restaurant', severity: 'error' });
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) return;
    setRejecting(true);
    try {
      await restaurantApi.delete(rejectTarget.restaurantId);
      setSnack({ open: true, msg: `"${rejectTarget.name}" rejected and removed.`, severity: 'warning' });
      setRejectTarget(null);
      fetchAll();
    } catch {
      setSnack({ open: true, msg: 'Failed to reject restaurant', severity: 'error' });
    } finally {
      setRejecting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await restaurantApi.delete(deleteTarget.restaurantId);
      setDeleteTarget(null);
      setSnack({ open: true, msg: 'Restaurant deleted', severity: 'success' });
      fetchAll();
    } catch {
      setSnack({ open: true, msg: 'Failed to delete restaurant', severity: 'error' });
    }
  };

  const display = tab === 0 ? pending : approved;

  const RestaurantCard = ({ restaurant }) => (
    <Card sx={cardSx}>
      {restaurant.imageUrl ? (
        <Box sx={{ height: 150, backgroundImage: `url(${restaurant.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      ) : (
        <Box sx={{ height: 130, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #fff7f4, #fff)' }}>
          <StorefrontOutlinedIcon sx={{ fontSize: 48, color: '#d9282f' }} />
        </Box>
      )}
      <CardContent>
        <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
          <Typography variant="h6" fontWeight={900} noWrap>{restaurant.name}</Typography>
          <Chip label={restaurant.isApproved ? 'Approved' : 'Pending'} color={restaurant.isApproved ? 'success' : 'warning'} sx={{ fontWeight: 900, borderRadius: 999 }} />
        </Stack>
        <Typography variant="body2" color="text.secondary">{restaurant.cuisine} - {restaurant.city}</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>{restaurant.address}</Typography>
        <Typography variant="caption" color="text.secondary">
          Owner #{restaurant.ownerId} | Min Rs {restaurant.minOrderAmount} | {restaurant.deliveryRadius}km radius
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap">
          {tab === 0 ? (
            <>
              <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} sx={{ borderRadius: 999, fontWeight: 900 }} onClick={() => handleApprove(restaurant.restaurantId)}>
                Approve
              </Button>
              <Button variant="outlined" color="error" startIcon={<CancelIcon />} sx={{ borderRadius: 999, fontWeight: 900 }} onClick={() => { setRejectTarget(restaurant); setRejectReason(''); }}>
                Reject
              </Button>
            </>
          ) : (
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} sx={{ borderRadius: 999, fontWeight: 900 }} onClick={() => setDeleteTarget(restaurant)}>
              Delete
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 3, md: 5 }, background: 'linear-gradient(180deg, rgba(255,247,242,0.9) 0%, #f7f8fb 360px, #f7f8fb 100%)' }}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, mb: 3, borderRadius: 4, color: '#fff', background: 'linear-gradient(135deg, #d9282f 0%, #ff4b1f 100%)', boxShadow: '0 22px 64px rgba(217,40,47,0.24)' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: 62, height: 62, bgcolor: 'rgba(255,255,255,0.18)' }}><RestaurantMenuOutlinedIcon fontSize="large" /></Avatar>
            <Box>
              <Typography variant="h4" fontWeight={900}>Restaurant Management</Typography>
              <Typography variant="body1" sx={{ opacity: 0.88 }}>Approve new restaurants and manage live listings.</Typography>
            </Box>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: 1, mb: 3, borderRadius: 999, display: 'inline-flex', border: '1px solid rgba(20,24,35,0.08)' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="error" indicatorColor="error" sx={{ minHeight: 42, '& .MuiTabs-indicator': { display: 'none' }, '& .MuiTab-root': { minHeight: 42, borderRadius: 999, px: 2.5, fontWeight: 900 }, '& .Mui-selected': { bgcolor: 'rgba(217,40,47,0.1)' } }}>
            <Tab label={`Pending (${pending.length})`} />
            <Tab label={`Approved (${approved.length})`} />
          </Tabs>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress color="error" /></Box>
        ) : display.length === 0 ? (
          <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={900}>{tab === 0 ? 'No pending approvals' : 'No approved restaurants yet'}</Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {display.map((restaurant) => (
              <Grid item xs={12} sm={6} md={4} key={restaurant.restaurantId}>
                <RestaurantCard restaurant={restaurant} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Dialog open={!!rejectTarget} onClose={() => !rejecting && setRejectTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={900}>Reject Restaurant</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You are rejecting <strong>{rejectTarget?.name}</strong>. Add a reason for the record.
          </Typography>
          <TextField fullWidth multiline rows={3} autoFocus label="Rejection Reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejectTarget(null)} disabled={rejecting}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleRejectConfirm} disabled={rejecting || !rejectReason.trim()}>
            {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Restaurant?"
        message={`Permanently delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <AppSnackbar
        open={snack.open}
        message={snack.msg}
        severity={snack.severity}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      />
    </Box>
  );
};

export default ApproveRestaurants;
