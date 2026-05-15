import React from 'react';
import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  color = 'error',
  onCancel,
  onConfirm,
}) => (
  <Dialog
    open={open}
    onClose={onCancel}
    maxWidth="xs"
    fullWidth
    PaperProps={{
      sx: {
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: '0 28px 80px rgba(24,28,42,0.28)',
      },
    }}
  >
    <DialogTitle sx={{ p: 3, pb: 1.5 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ bgcolor: color === 'error' ? '#fef2f2' : '#fff7ed', color: color === 'error' ? '#dc2626' : '#ea580c' }}>
          <WarningAmberRoundedIcon />
        </Avatar>
        <Typography variant="h6" fontWeight={950}>{title}</Typography>
      </Stack>
    </DialogTitle>
    <DialogContent sx={{ px: 3 }}>
      <Typography color="text.secondary">{message}</Typography>
    </DialogContent>
    <DialogActions sx={{ p: 3, pt: 2 }}>
      <Button onClick={onCancel} sx={{ borderRadius: 999, fontWeight: 900 }}>
        {cancelText}
      </Button>
      <Button variant="contained" color={color} onClick={onConfirm} sx={{ borderRadius: 999, fontWeight: 900, px: 2.5 }}>
        {confirmText}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
