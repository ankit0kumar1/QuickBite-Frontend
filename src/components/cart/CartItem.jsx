// src/components/cart/CartItem.jsx
import React from 'react';
import { Avatar, Box, IconButton, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import RemoveIcon from '@mui/icons-material/Remove';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';
import { useCart } from '../../context/CartContext';

const CartItemComponent = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();

  const handleIncrease = () => {
    updateQuantity(item.menuItemId, item.quantity + 1);
  };

  const handleDecrease = () => {
    if (item.quantity === 1) {
      removeItem(item.menuItemId);
    } else {
      updateQuantity(item.menuItemId, item.quantity - 1);
    }
  };

  return (
    <Box
      sx={{
        p: 1.75,
        borderRadius: 3,
        border: '1px solid rgba(20,24,35,0.08)',
        bgcolor: '#fff',
        boxShadow: '0 10px 26px rgba(24,28,42,0.06)',
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Avatar
          sx={{
            width: 44,
            height: 44,
            bgcolor: 'rgba(217,40,47,0.1)',
            color: '#d9282f',
            flexShrink: 0,
          }}
        >
          <RestaurantMenuOutlinedIcon fontSize="small" />
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={900} noWrap>
            {item.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Rs {item.price} x {item.quantity}
          </Typography>
          {item.customization && (
            <Typography variant="caption" color="text.secondary" display="block">
              Note: {item.customization}
            </Typography>
          )}

          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.5 }}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <IconButton
                size="small"
                onClick={handleDecrease}
                sx={{
                  width: 30,
                  height: 30,
                  border: '1px solid rgba(217,40,47,0.3)',
                  color: '#d9282f',
                  bgcolor: '#fff',
                  '&:hover': { bgcolor: '#fff1f1' },
                }}
              >
                {item.quantity === 1
                  ? <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                  : <RemoveIcon sx={{ fontSize: 16 }} />}
              </IconButton>

              <Typography
                variant="body2"
                fontWeight={900}
                sx={{
                  minWidth: 28,
                  height: 30,
                  px: 1,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 999,
                  bgcolor: '#f7f8fb',
                }}
              >
                {item.quantity}
              </Typography>

              <IconButton
                size="small"
                onClick={handleIncrease}
                sx={{
                  width: 30,
                  height: 30,
                  border: '1px solid rgba(217,40,47,0.3)',
                  color: '#d9282f',
                  bgcolor: '#fff',
                  '&:hover': { bgcolor: '#fff1f1' },
                }}
              >
                <AddIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Stack>

            <Typography variant="subtitle1" fontWeight={900}>
              Rs {item.subtotal?.toFixed(0)}
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default CartItemComponent;
