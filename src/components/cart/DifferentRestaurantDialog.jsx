// src/components/cart/DifferentRestaurantDialog.jsx
import React from 'react';
import {
  Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Typography,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useCart } from '../../context/CartContext';

const DifferentRestaurantDialog = () => {
  const { dialogOpen,
          confirmSwitch,
          cancelSwitch } = useCart();

  return (
    <Dialog open={dialogOpen}
            onClose={cancelSwitch}
            maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex',
                         alignItems: 'center', gap: 1 }}>
        <WarningAmberIcon color="warning" />
        Start New Cart?
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2"
                    color="text.secondary">
          Your cart already has items from another restaurant.
          Adding this item will clear your current cart
          and start a new one.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={cancelSwitch}
                variant="outlined"
                color="inherit">
          Keep Current Cart
        </Button>
        <Button onClick={confirmSwitch}
                variant="contained"
                color="error">
          Start New Cart
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DifferentRestaurantDialog;