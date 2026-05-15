// src/components/restaurant/RestaurantCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Rating,
  Stack,
  Typography,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();

  const {
    restaurantId,
    name,
    cuisine,
    city,
    avgRating,
    estimatedDeliveryMin,
    minOrderAmount,
    imageUrl,
    isOpen,
    deliveryRadius,
  } = restaurant;

  const rating = Number(avgRating || 0);

  const handleClick = () => {
    navigate(`/restaurant/${restaurantId}`);
  };

  return (
    <Card
      onClick={handleClick}
      sx={{
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid rgba(20, 24, 35, 0.08)',
        background: '#fff',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 18px 45px rgba(20,24,35,0.14)',
          borderColor: 'rgba(229,57,53,0.18)',
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="190"
          image={
            imageUrl ||
            `https://placehold.co/640x360/ff7043/ffffff?text=${encodeURIComponent(cuisine || 'QuickBite')}`
          }
          alt={name}
          sx={{
            objectFit: 'cover',
            filter: isOpen ? 'none' : 'grayscale(0.45)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.02) 35%, rgba(0,0,0,0.34) 100%)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            right: 14,
            bottom: 14,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.35,
            py: 0.65,
            borderRadius: 999,
            color: '#fff',
            fontWeight: 800,
            fontSize: 13,
            lineHeight: 1,
            letterSpacing: 0.2,
            background: isOpen
              ? 'linear-gradient(135deg, rgba(34,164,71,0.98), rgba(22,128,57,0.98))'
              : 'linear-gradient(135deg, rgba(55,65,81,0.98), rgba(17,24,39,0.98))',
            border: '1px solid rgba(255,255,255,0.45)',
            boxShadow: isOpen
              ? '0 10px 28px rgba(34,164,71,0.34)'
              : '0 10px 28px rgba(17,24,39,0.28)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box
            sx={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              bgcolor: '#fff',
              boxShadow: isOpen
                ? '0 0 0 4px rgba(255,255,255,0.22), 0 0 12px rgba(255,255,255,0.8)'
                : '0 0 0 4px rgba(255,255,255,0.18)',
            }}
          />
          {isOpen ? 'Open now' : 'Closed'}
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 1 }}>
          <Typography variant="h6" fontWeight="bold" noWrap sx={{ lineHeight: 1.25 }}>
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.5 }}>
            {cuisine} - {city}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
          <Rating value={rating} precision={0.5} size="small" readOnly />
          <Typography variant="body2" fontWeight={800}>
            {rating.toFixed(1)}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
            <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {estimatedDeliveryMin} mins
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
            <LocalOfferIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              Min Rs {minOrderAmount}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
            <LocationOnOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {deliveryRadius} km
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default RestaurantCard;
