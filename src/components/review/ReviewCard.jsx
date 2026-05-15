// src/components/review/ReviewCard.jsx
import React  from 'react';
import {
  Box, Typography, Paper,
  Chip, Avatar, Divider,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import { StarDisplay } from './StarRating';

const ReviewCard = ({ review }) => {
  const {
    reviewId,
    customerId,
    foodRating,
    deliveryRating,
    comment,
    reviewDate,
    isVerified,
  } = review;

  const formattedDate = new Date(reviewDate)
    .toLocaleDateString('en-IN', {
      day  : 'numeric',
      month: 'short',
      year : 'numeric',
    });

  return (
    <Paper
      elevation={0}
      sx={{
        p           : 2.5,
        mb          : 2,
        borderRadius: 2,
        border      : '1px solid #f0f0f0',
        '&:hover'   : {
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        },
      }}
    >
      {/* ── Header ── */}
      <Box sx={{ display: 'flex',
                 justifyContent: 'space-between',
                 alignItems: 'flex-start',
                 mb: 1.5 }}>
        <Box sx={{ display: 'flex',
                   alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{ bgcolor: '#d32f2f',
                  width: 36, height: 36,
                  fontSize: 14 }}
          >
            C{customerId}
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex',
                       alignItems: 'center', gap: 0.5 }}>
              <Typography variant="subtitle2"
                          fontWeight="bold">
                Customer #{customerId}
              </Typography>
              {isVerified && (
                <VerifiedIcon
                  sx={{ fontSize: 14,
                        color: '#1976d2' }}
                />
              )}
            </Box>
            <Typography variant="caption"
                        color="text.secondary">
              {formattedDate}
            </Typography>
          </Box>
        </Box>

        <Chip
          label={`Order #${review.orderId}`}
          size="small"
          variant="outlined"
          sx={{ fontSize: 10 }}
        />
      </Box>

      {/* ── Ratings ── */}
      <Box sx={{ display: 'flex',
                 gap: 3, mb: 1.5,
                 flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="caption"
                      color="text.secondary">
            🍽️ Food Quality
          </Typography>
          <Box sx={{ display: 'flex',
                     alignItems: 'center', gap: 0.5 }}>
            <StarDisplay value={foodRating} />
            <Typography variant="body2"
                        fontWeight="bold">
              {foodRating}/5
            </Typography>
          </Box>
        </Box>

        {deliveryRating && (
          <Box>
            <Typography variant="caption"
                        color="text.secondary">
              🛵 Delivery
            </Typography>
            <Box sx={{ display: 'flex',
                       alignItems: 'center', gap: 0.5 }}>
              <StarDisplay value={deliveryRating} />
              <Typography variant="body2"
                          fontWeight="bold">
                {deliveryRating}/5
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* ── Comment ── */}
      {comment && (
        <>
          <Divider sx={{ mb: 1.5 }} />
          <Typography variant="body2"
                      color="text.secondary"
                      sx={{ fontStyle: 'italic' }}>
            "{comment}"
          </Typography>
        </>
      )}
    </Paper>
  );
};

export default ReviewCard;