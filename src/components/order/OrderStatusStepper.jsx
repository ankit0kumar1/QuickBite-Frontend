// src/components/order/OrderStatusStepper.jsx
import React from 'react';
import { Box, Step, StepLabel, Stepper, Typography } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DeliveryDiningOutlinedIcon from '@mui/icons-material/DeliveryDiningOutlined';
import DoneAllOutlinedIcon from '@mui/icons-material/DoneAllOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

const STEPS = [
  { label: 'Order Placed', status: 'PLACED', icon: <ReceiptLongOutlinedIcon fontSize="small" /> },
  { label: 'Confirmed', status: 'CONFIRMED', icon: <CheckRoundedIcon fontSize="small" /> },
  { label: 'Preparing', status: 'PREPARING', icon: <RestaurantOutlinedIcon fontSize="small" /> },
  { label: 'Picked Up', status: 'PICKED_UP', icon: <DeliveryDiningOutlinedIcon fontSize="small" /> },
  { label: 'Delivered', status: 'DELIVERED', icon: <DoneAllOutlinedIcon fontSize="small" /> },
];

const getActiveStep = (status) => {
  if (status === 'CANCELLED') return -1;
  const idx = STEPS.findIndex((step) => step.status === status);
  return idx === -1 ? 0 : idx;
};

const OrderStatusStepper = ({ status }) => {
  const activeStep = getActiveStep(status);
  const isCancelled = status === 'CANCELLED';

  if (isCancelled) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 3,
          px: 3,
          bgcolor: '#fef2f2',
          border: '1px solid rgba(220,38,38,0.18)',
          borderRadius: 3,
        }}
      >
        <Inventory2OutlinedIcon color="error" />
        <Typography variant="h6" color="error" fontWeight={900}>
          Order Cancelled
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', py: 2 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {STEPS.map((step, index) => {
          const completed = index < activeStep;
          const current = index === activeStep;

          return (
            <Step key={step.status} completed={completed}>
              <StepLabel
                StepIconComponent={() => (
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: completed || current ? '#d9282f' : '#e5e7eb',
                      color: completed || current ? '#fff' : '#6b7280',
                      border: current ? '4px solid rgba(217,40,47,0.22)' : '4px solid transparent',
                      boxShadow: current ? '0 12px 26px rgba(217,40,47,0.26)' : 'none',
                    }}
                  >
                    {completed ? <CheckRoundedIcon fontSize="small" /> : step.icon}
                  </Box>
                )}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: current ? 900 : 700,
                    color: current ? '#d9282f' : 'text.secondary',
                  }}
                >
                  {step.label}
                </Typography>
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
};

export default OrderStatusStepper;
