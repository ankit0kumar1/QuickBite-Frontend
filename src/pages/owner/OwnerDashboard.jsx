// src/pages/owner/OwnerDashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BarChartIcon from '@mui/icons-material/BarChart';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useAuth } from '../../context/AuthContext';

const OWNER_CARDS = [
  {
    title: 'My Restaurants',
    description: 'Register locations, review approval status, and update restaurant details.',
    icon: <RestaurantIcon />,
    path: '/owner/restaurants',
    accent: '#d32f2f',
  },
  {
    title: 'Manage Menu',
    description: 'Create categories, update prices, availability, tags, and dish images.',
    icon: <MenuBookIcon />,
    path: '/owner/menu',
    accent: '#ea580c',
  },
  {
    title: 'Incoming Orders',
    description: 'Track new orders, preparation flow, and handoff status from one place.',
    icon: <ReceiptLongIcon />,
    path: '/owner/orders',
    accent: '#2563eb',
  },
  {
    title: 'Earnings & Analytics',
    description: 'See revenue, popular dishes, order trends, and performance signals.',
    icon: <BarChartIcon />,
    path: '/owner/earnings',
    accent: '#168039',
  },
  {
    title: 'Customer Reviews',
    description: 'Read food ratings and customer feedback across your restaurants.',
    icon: <RateReviewIcon />,
    path: '/owner/reviews',
    accent: '#7c3aed',
  },
];

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f8fb', py: { xs: 3, md: 4 } }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Chip
              icon={<StorefrontIcon />}
              label="Owner workspace"
              sx={{
                mb: 1.25,
                bgcolor: '#fff1f2',
                color: '#b91c1c',
                fontWeight: 900,
                borderRadius: 999,
              }}
            />
            <Typography variant="h4" fontWeight={950} color="#171827">
              Good to see you, {user?.fullName || 'Owner'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75, maxWidth: 640 }}>
              Manage restaurants, menus, orders, earnings, and customer feedback from one focused dashboard.
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="error"
            startIcon={<AddBusinessIcon />}
            onClick={() => navigate('/owner/restaurants')}
            sx={{ borderRadius: 999, px: 2.5, py: 1.1, fontWeight: 900, boxShadow: '0 12px 28px rgba(211,47,47,0.24)' }}
          >
            Add Restaurant
          </Button>
        </Stack>

        <Grid container spacing={2.5}>
          {OWNER_CARDS.map((card) => (
            <Grid item xs={12} sm={6} md={card.title === 'Manage Menu' ? 6 : 4} key={card.title}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: 2,
                  border: '1px solid rgba(20,24,35,0.08)',
                  boxShadow: '0 16px 42px rgba(24,28,42,0.07)',
                  transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 20px 52px rgba(24,28,42,0.12)',
                    borderColor: `${card.accent}40`,
                  },
                }}
              >
                <CardActionArea onClick={() => navigate(card.path)} sx={{ height: '100%', p: 2.5 }}>
                  <CardContent sx={{ p: 0, height: '100%' }}>
                    <Stack spacing={2.2} sx={{ height: '100%' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: `${card.accent}12`,
                            color: card.accent,
                            '& svg': { fontSize: 28 },
                          }}
                        >
                          {card.icon}
                        </Box>
                        <ArrowForwardIcon sx={{ color: 'text.disabled' }} />
                      </Stack>

                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight={950} color="#24242b">
                          {card.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, lineHeight: 1.65 }}>
                          {card.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default OwnerDashboard;
