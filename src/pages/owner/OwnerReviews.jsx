// src/pages/owner/OwnerReviews.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Card, CardContent,
  CircularProgress, Alert, Grid, Rating,
  Select, MenuItem, FormControl, InputLabel,
  Divider, Chip,
} from '@mui/material';
import restaurantApi from '../../api/restaurantApi';
import axiosInstance  from '../../api/axiosInstance';

const OwnerReviews = () => {
  const [restaurants,    setRestaurants]    = useState([]);
  const [selectedRestId, setSelectedRestId] = useState('');
  const [reviews,        setReviews]        = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');

  useEffect(() => { fetchMyRestaurants(); }, []);

  const fetchMyRestaurants = async () => {
    try {
      const res = await restaurantApi.getMyRestaurants();
      setRestaurants(res.data);
      if (res.data.length > 0) setSelectedRestId(res.data[0].restaurantId);
    } catch {
      setError('Failed to load restaurants');
    }
  };

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get(
        `/reviews/restaurant/${selectedRestId}`
      );
      setReviews(res.data);
    } catch {
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [selectedRestId]);

  useEffect(() => { if (selectedRestId) fetchReviews(); }, [fetchReviews, selectedRestId]);

  const formatDate = (d) =>
    new Date(d).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.foodRating || 0), 0) / reviews.length).toFixed(1)
    : '—';

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          ⭐ Customer Reviews
        </Typography>

        {/* Restaurant Selector */}
        {restaurants.length > 1 && (
          <FormControl size="small" sx={{ mb: 3, minWidth: 250 }}>
            <InputLabel>Restaurant</InputLabel>
            <Select
              value={selectedRestId}
              label="Restaurant"
              onChange={e => setSelectedRestId(e.target.value)}
            >
              {restaurants.map(r => (
                <MenuItem key={r.restaurantId} value={r.restaurantId}>
                  {r.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Summary */}
        {reviews.length > 0 && (
          <Box sx={{
            p: 2, mb: 3, bgcolor: 'white',
            borderRadius: 3, display: 'flex', gap: 4,
            alignItems: 'center',
          }}>
            <Box>
              <Typography variant="h3" fontWeight="bold" color="error.main">
                {avgRating}
              </Typography>
              <Rating value={parseFloat(avgRating)} readOnly precision={0.1} />
              <Typography variant="caption" color="text.secondary">
                Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="error" />
          </Box>
        ) : reviews.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              ⭐ No reviews yet for this restaurant
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {reviews.map(r => (
              <Grid item xs={12} key={r.reviewId}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Customer #{r.customerId}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Order #{r.orderId} • {formatDate(r.reviewDate)}
                        </Typography>
                      </Box>
                      <Chip
                        label={r.isVerified ? 'Verified' : 'Unverified'}
                        color={r.isVerified ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 4, mb: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Food Quality</Typography>
                        <Rating value={r.foodRating} readOnly size="small" />
                      </Box>
                      {r.deliveryRating && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Delivery</Typography>
                          <Rating value={r.deliveryRating} readOnly size="small" />
                        </Box>
                      )}
                    </Box>

                    {r.comment && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body2">"{r.comment}"</Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default OwnerReviews;
