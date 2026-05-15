// src/components/menu/MenuItemCard.jsx
import React from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useCart } from '../../context/CartContext';

const MenuItemCard = ({ item, restaurantId, onAddToCart }) => {
  const { addItem } = useCart();

  const {
    name,
    description,
    price,
    discountedPrice,
    isVeg,
    isAvailable,
    calories,
    tags,
    imageUrl,
  } = item;

  const displayPrice = discountedPrice || price;
  const hasDiscount = discountedPrice && discountedPrice < price;
  const tagList = tags ? tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [];

  const handleAdd = () => {
    addItem(item, restaurantId);
    onAddToCart?.(item);
  };

  return (
    <Card
      elevation={0}
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr 112px', sm: '1fr 150px' },
        gap: { xs: 1.5, sm: 2 },
        p: { xs: 1.75, sm: 2 },
        borderRadius: 2,
        opacity: isAvailable ? 1 : 0.55,
        border: '1px solid rgba(20,24,35,0.08)',
        boxShadow: '0 12px 32px rgba(24,28,42,0.06)',
        transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
        '&:hover': {
          transform: isAvailable ? 'translateY(-2px)' : 'none',
          boxShadow: '0 16px 42px rgba(24,28,42,0.1)',
          borderColor: 'rgba(211,47,47,0.22)',
        },
      }}
    >
      <Stack spacing={0.85} sx={{ minWidth: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Box
            sx={{
              width: 18,
              height: 18,
              border: `2px solid ${isVeg ? '#168039' : '#c62828'}`,
              borderRadius: '3px',
              display: 'grid',
              placeItems: 'center',
              flex: '0 0 auto',
            }}
          >
            <FiberManualRecordIcon sx={{ fontSize: 8, color: isVeg ? '#168039' : '#c62828' }} />
          </Box>

          {!isAvailable && (
            <Chip label="Unavailable" size="small" sx={{ height: 22, borderRadius: 999, fontWeight: 800 }} />
          )}
        </Stack>

        <Box>
          <Typography variant="subtitle1" fontWeight={950} color="#24242b" noWrap>
            {name}
          </Typography>
          {description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.25,
                lineHeight: 1.45,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {description}
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          {calories && (
            <Chip
              size="small"
              icon={<LocalFireDepartmentIcon />}
              label={`${calories} cal`}
              sx={{ height: 24, borderRadius: 999, bgcolor: '#fff7ed', color: '#c2410c', fontWeight: 800 }}
            />
          )}
          {tagList.slice(0, 2).map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              icon={<LocalOfferIcon />}
              sx={{ height: 24, borderRadius: 999, bgcolor: '#f3f4f6', fontWeight: 800 }}
            />
          ))}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6" fontWeight={950} color="#24242b">
            Rs.{displayPrice}
          </Typography>
          {hasDiscount && (
            <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
              Rs.{price}
            </Typography>
          )}
          {hasDiscount && (
            <Chip
              label={`${Math.round(((price - discountedPrice) / price) * 100)}% off`}
              size="small"
              color="success"
              sx={{ height: 22, borderRadius: 999, fontWeight: 900 }}
            />
          )}
        </Stack>
      </Stack>

      <Stack alignItems="center" spacing={1}>
        <Box
          component="img"
          src={imageUrl || `https://placehold.co/180x140/f97316/ffffff?text=${encodeURIComponent(name.slice(0, 10))}`}
          alt={name}
          sx={{
            width: { xs: 112, sm: 150 },
            height: { xs: 94, sm: 112 },
            objectFit: 'cover',
            borderRadius: 2,
            bgcolor: '#f3f4f6',
          }}
        />

        <Tooltip title={!isAvailable ? 'Currently unavailable' : 'Add to cart'}>
          <span>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<AddIcon />}
              disabled={!isAvailable}
              onClick={handleAdd}
              sx={{
                borderRadius: 999,
                textTransform: 'none',
                minWidth: { xs: 94, sm: 112 },
                fontWeight: 950,
                bgcolor: '#fff',
              }}
            >
              Add
            </Button>
          </span>
        </Tooltip>
      </Stack>
    </Card>
  );
};

export default MenuItemCard;
