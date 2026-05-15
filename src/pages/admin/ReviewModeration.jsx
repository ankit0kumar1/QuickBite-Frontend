// src/pages/admin/ReviewModeration.jsx
import React, { useEffect, useMemo, useState } from 'react';
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
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Rating,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import SearchIcon from '@mui/icons-material/Search';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import VerifiedIcon from '@mui/icons-material/Verified';
import reviewApi from '../../api/reviewApi';

const ReviewModeration = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reviewApi.getAllReviews();
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await reviewApi.verifyReview(id);
      setReviews((prev) => prev.map((review) => (
        review.reviewId === id ? { ...review, isVerified: true } : review
      )));
      setSnack({ open: true, msg: 'Review verified', severity: 'success' });
    } catch {
      setSnack({ open: true, msg: 'Failed to verify review', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await reviewApi.deleteReview(deleteTarget.reviewId);
      setReviews((prev) => prev.filter((review) => review.reviewId !== deleteTarget.reviewId));
      setSnack({ open: true, msg: 'Review removed', severity: 'warning' });
    } catch {
      setSnack({ open: true, msg: 'Failed to delete review', severity: 'error' });
    }
    setDeleteTarget(null);
  };

  const counts = useMemo(() => ({
    all: reviews.length,
    verified: reviews.filter((review) => review.isVerified).length,
    unverified: reviews.filter((review) => !review.isVerified).length,
  }), [reviews]);

  const filtered = reviews.filter((review) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'verified' && review.isVerified) ||
      (filter === 'unverified' && !review.isVerified);
    const query = search.toLowerCase();
    const matchesSearch =
      !query ||
      review.comment?.toLowerCase().includes(query) ||
      String(review.restaurantId).includes(query) ||
      String(review.orderId).includes(query);
    return matchesFilter && matchesSearch;
  });

  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.foodRating || 0), 0) / reviews.length
    : 0;

  const formatDate = (date) => (
    date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'
  );

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 3, md: 5 }, background: 'linear-gradient(180deg, rgba(255,247,242,0.9) 0%, #f7f8fb 340px, #f7f8fb 100%)' }}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, mb: 3, borderRadius: 4, color: '#fff', background: 'linear-gradient(135deg, #d9282f 0%, #ff4b1f 100%)', boxShadow: '0 22px 64px rgba(217,40,47,0.22)' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.18)' }}><RateReviewOutlinedIcon fontSize="large" /></Avatar>
            <Box>
              <Typography variant="h4" fontWeight={950}>Review Moderation</Typography>
              <Typography sx={{ opacity: 0.86 }}>Verify customer feedback, remove unsafe reviews, and keep ratings trustworthy.</Typography>
            </Box>
          </Stack>
        </Paper>

        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {[
            ['Total Reviews', counts.all, '#d9282f'],
            ['Pending', counts.unverified, '#f97316'],
            ['Verified', counts.verified, '#16a34a'],
            ['Average Rating', averageRating.toFixed(1), '#2563eb'],
          ].map(([label, value, color]) => (
            <Grid item xs={12} sm={6} md={3} key={label}>
              <Paper elevation={0} sx={{ p: 2.25, borderRadius: 4, border: '1px solid rgba(20,24,35,0.08)', boxShadow: '0 14px 42px rgba(24,28,42,0.06)' }}>
                <Typography variant="body2" color="text.secondary" fontWeight={800}>{label}</Typography>
                <Typography variant="h4" fontWeight={950} sx={{ color }}>{value}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 4, border: '1px solid rgba(20,24,35,0.08)' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {[
                ['all', 'All'],
                ['unverified', 'Pending'],
                ['verified', 'Verified'],
              ].map(([key, label]) => (
                <Chip key={key} label={`${label} (${counts[key]})`} onClick={() => setFilter(key)} color={filter === key ? 'error' : 'default'} variant={filter === key ? 'filled' : 'outlined'} sx={{ borderRadius: 999, fontWeight: 900 }} />
              ))}
            </Stack>
            <TextField
              size="small"
              placeholder="Search comment, restaurant, or order"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              sx={{ ml: { md: 'auto' }, minWidth: { xs: '100%', md: 360 }, '& .MuiOutlinedInput-root': { borderRadius: 999, bgcolor: '#fff' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                ),
                endAdornment: search && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch('')}><ClearIcon fontSize="small" /></IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="error" />
          </Box>
        ) : filtered.length === 0 ? (
          <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>
            <Typography variant="h6" color="text.secondary">No reviews found</Typography>
          </Paper>
        ) : (
          <Stack spacing={2.5}>
            {filtered.map((review) => (
              <Card key={review.reviewId} sx={{ borderRadius: 4, border: '1px solid rgba(20,24,35,0.08)', boxShadow: '0 16px 48px rgba(24,28,42,0.08)' }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Avatar sx={{ bgcolor: review.isVerified ? '#f0fdf4' : '#fff7ed', color: review.isVerified ? '#15803d' : '#ea580c' }}>
                        <StarRoundedIcon />
                      </Avatar>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="h6" fontWeight={950}>Review #{review.reviewId}</Typography>
                          <Chip label={review.isVerified ? 'Verified' : 'Pending'} color={review.isVerified ? 'success' : 'warning'} size="small" sx={{ borderRadius: 999, fontWeight: 900 }} />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Order #{review.orderId} - Restaurant #{review.restaurantId} - Customer #{review.customerId} - {formatDate(review.reviewDate)}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      {!review.isVerified && (
                        <Button variant="contained" color="success" size="small" startIcon={<VerifiedIcon />} sx={{ borderRadius: 999, fontWeight: 900 }} onClick={() => handleVerify(review.reviewId)}>
                          Verify
                        </Button>
                      )}
                      <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} sx={{ borderRadius: 999, fontWeight: 900 }} onClick={() => setDeleteTarget(review)}>
                        Remove
                      </Button>
                    </Stack>
                  </Stack>

                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary" fontWeight={800}>Food Rating</Typography>
                      <Rating value={Number(review.foodRating || 0)} readOnly size="small" />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary" fontWeight={800}>Delivery Rating</Typography>
                      <Rating value={Number(review.deliveryRating || 0)} readOnly size="small" />
                    </Grid>
                  </Grid>

                  {review.comment && (
                    <Paper elevation={0} sx={{ mt: 2, p: 2, bgcolor: '#f8fafc', borderLeft: '4px solid #d9282f', borderRadius: 3 }}>
                      <Typography variant="body2">{review.comment}</Typography>
                    </Paper>
                  )}
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Container>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle fontWeight={950}>Remove Review?</DialogTitle>
        <DialogContent>
          <DialogContentText>This review will be permanently removed from moderation.</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ borderRadius: 999, fontWeight: 800 }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} startIcon={<DeleteIcon />} sx={{ borderRadius: 999, fontWeight: 900 }}>Remove</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack((current) => ({ ...current, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} variant="filled" sx={{ borderRadius: 3 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ReviewModeration;
