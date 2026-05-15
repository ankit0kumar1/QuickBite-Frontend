import React from 'react';
import { Alert, Snackbar } from '@mui/material';

const AppSnackbar = ({ open, message, severity = 'success', onClose }) => (
  <Snackbar
    open={open}
    autoHideDuration={3600}
    onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
  >
    <Alert
      severity={severity}
      variant="filled"
      onClose={onClose}
      sx={{
        borderRadius: 3,
        fontWeight: 800,
        boxShadow: '0 18px 48px rgba(24,28,42,0.24)',
      }}
    >
      {message}
    </Alert>
  </Snackbar>
);

export default AppSnackbar;
