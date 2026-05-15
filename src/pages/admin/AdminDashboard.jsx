// src/pages/admin/AdminDashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import StarIcon from '@mui/icons-material/Star';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import { useAuth } from '../../context/AuthContext';

const ADMIN_CARDS = [
  { title: 'Approve Restaurants', description: 'Review and approve new restaurants', icon: <CheckCircleIcon />, path: '/admin/restaurants', color: '#168039' },
  { title: 'Manage Users', description: 'View, suspend, activate, or delete users', icon: <PeopleIcon />, path: '/admin/users', color: '#2563eb' },
  { title: 'Verify Agents', description: 'Verify delivery agent identities and vehicles', icon: <TwoWheelerIcon />, path: '/admin/agents', color: '#ea580c' },
  { title: 'All Orders', description: 'Monitor all platform orders', icon: <ReceiptLongIcon />, path: '/admin/orders', color: '#7c3aed' },
  { title: 'Platform Analytics', description: 'View platform stats and insights', icon: <BarChartIcon />, path: '/admin/analytics', color: '#0f766e' },
  { title: 'Review Moderation', description: 'Verify or remove customer reviews', icon: <StarIcon />, path: '/admin/reviews', color: '#d9282f' },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 3, md: 5 }, background: 'linear-gradient(180deg, rgba(255,247,242,0.9) 0%, #f7f8fb 360px, #f7f8fb 100%)' }}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, mb: 3, borderRadius: 4, color: '#fff', background: 'linear-gradient(135deg, #d9282f 0%, #ff4b1f 100%)', boxShadow: '0 22px 64px rgba(217,40,47,0.24)' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.18)' }}>
              <ShieldOutlinedIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={900}>Admin Dashboard</Typography>
              <Typography variant="body1" sx={{ opacity: 0.88 }}>
                Welcome, {user?.fullName}! Manage the entire QuickBite platform.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Grid container spacing={3}>
          {ADMIN_CARDS.map((card) => (
            <Grid item xs={12} sm={6} md={4} key={card.title}>
              <Card sx={{ borderRadius: 4, height: '100%', border: '1px solid rgba(20,24,35,0.08)', boxShadow: '0 16px 48px rgba(24,28,42,0.08)' }}>
                <CardActionArea onClick={() => navigate(card.path)} sx={{ p: 3, height: '100%' }}>
                  <CardContent>
                    <Avatar sx={{ width: 64, height: 64, bgcolor: `${card.color}18`, color: card.color, mb: 2 }}>
                      {card.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight={900}>{card.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {card.description}
                    </Typography>
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

export default AdminDashboard;
