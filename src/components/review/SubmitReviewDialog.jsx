// src/components/review/SubmitReviewDialog.jsx
import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent,
  DialogActions, Button, TextField,
  Typography, Box, Alert,
  CircularProgress,
} from '@mui/material';
import StarRating from './StarRating';
import reviewApi  from '../../api/reviewApi';

const SubmitReviewDialog = ({
  open,
  onClose,
  order,           // the order being reviewed
  onSuccess,       // callback after submit
}) => {
  const [foodRating,     setFoodRating]     = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [comment,        setComment]        = useState('');
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');

  const handleSubmit = async () => {
    if (foodRating === 0) {
      setError('Please rate the food quality');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await reviewApi.addReview({
        orderId        : order.orderId,
        restaurantId   : order.restaurantId,
        agentId        : order.deliveryAgentId || null,
        foodRating,
        deliveryRating : deliveryRating || null,
        comment        : comment.trim() || null,
      });

      // Reset form
      setFoodRating(0);
      setDeliveryRating(0);
      setComment('');

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to submit review'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <Dialog open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth>
      <DialogTitle fontWeight="bold">
        ⭐ Rate Your Order #{order?.orderId}
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Food Rating */}
        <Box sx={{ mb: 3 }}>
          <StarRating
            label="🍽️ Food Quality *"
            value={foodRating}
            onChange={setFoodRating}
          />
        </Box>

        {/* Delivery Rating */}
        <Box sx={{ mb: 3 }}>
          <StarRating
            label="🛵 Delivery Experience (optional)"
            value={deliveryRating}
            onChange={setDeliveryRating}
          />
        </Box>

        {/* Comment */}
        <Box>
          <Typography variant="body2"
                      fontWeight="bold"
                      gutterBottom>
            💬 Your Review (optional)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            inputProps={{ maxLength: 500 }}
            helperText={`${comment.length}/500`}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={handleClose}
                color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleSubmit}
          disabled={loading || foodRating === 0}
          sx={{ borderRadius: 2 }}
        >
          {loading
            ? <CircularProgress size={20}
                                color="inherit" />
            : 'Submit Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubmitReviewDialog;