// src/components/review/StarRating.jsx
import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import StarIcon        from '@mui/icons-material/Star';
import StarBorderIcon  from '@mui/icons-material/StarBorder';
import StarHalfIcon    from '@mui/icons-material/StarHalf';

// ── Read-only display stars ───────────────────────────
export const StarDisplay = ({ value = 0, size = 'small' }) => {
  const stars  = [];
  const filled = Math.floor(value);
  const half   = value % 1 >= 0.5;

  for (let i = 1; i <= 5; i++) {
    if (i <= filled) {
      stars.push(
        <StarIcon
          key={i}
          sx={{ fontSize: size === 'small' ? 16 : 22,
                color: '#FFA726' }}
        />
      );
    } else if (i === filled + 1 && half) {
      stars.push(
        <StarHalfIcon
          key={i}
          sx={{ fontSize: size === 'small' ? 16 : 22,
                color: '#FFA726' }}
        />
      );
    } else {
      stars.push(
        <StarBorderIcon
          key={i}
          sx={{ fontSize: size === 'small' ? 16 : 22,
                color: '#FFA726' }}
        />
      );
    }
  }
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {stars}
    </Box>
  );
};

// ── Interactive rating input ──────────────────────────
const StarRating = ({ value, onChange, label }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <Box>
      {label && (
        <Typography variant="body2"
                    fontWeight="bold"
                    gutterBottom>
          {label}
        </Typography>
      )}
      <Box sx={{ display: 'flex',
                 alignItems: 'center', gap: 0.5 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Box
            key={star}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            sx={{ cursor: 'pointer' }}
          >
            {star <= (hovered || value)
              ? <StarIcon sx={{ fontSize: 32,
                                color: '#FFA726',
                                transition: '0.1s' }} />
              : <StarBorderIcon
                  sx={{ fontSize: 32,
                        color: '#FFA726',
                        transition: '0.1s' }} />
            }
          </Box>
        ))}

        <Typography variant="body2"
                    color="text.secondary"
                    sx={{ ml: 1 }}>
          {hovered || value
            ? ['', 'Poor', 'Fair',
               'Good', 'Very Good',
               'Excellent'][hovered || value]
            : 'Select rating'}
        </Typography>
      </Box>
    </Box>
  );
};

export default StarRating;