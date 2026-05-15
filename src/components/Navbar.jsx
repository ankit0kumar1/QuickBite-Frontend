// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DeliveryDiningOutlinedIcon from '@mui/icons-material/DeliveryDiningOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import NotificationBell from './notification/NotificationBell';

const navButtonSx = {
  color: 'white',
  px: 1.4,
  py: 0.9,
  borderRadius: 999,
  fontWeight: 800,
  whiteSpace: 'nowrap',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
};

const outlinedButtonSx = {
  color: 'white',
  borderColor: 'rgba(255,255,255,0.52)',
  borderRadius: 999,
  px: { xs: 1.25, md: 1.75 },
  fontWeight: 900,
  whiteSpace: 'nowrap',
  '&:hover': {
    borderColor: 'rgba(255,255,255,0.86)',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems, setDrawerOpen } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate('/login');
  };

  const firstName = user?.fullName?.split(' ')[0] || 'User';
  const roleHome = user?.role === 'OWNER'
    ? { label: 'Dashboard', path: '/owner', icon: <DashboardOutlinedIcon /> }
    : user?.role === 'ADMIN'
      ? { label: 'Admin', path: '/admin', icon: <ShieldOutlinedIcon /> }
      : user?.role === 'AGENT'
        ? { label: 'Agent', path: '/agent', icon: <DeliveryDiningOutlinedIcon /> }
        : null;

  const mobileItems = [
    { label: 'Restaurants', path: '/home', icon: <RestaurantMenuOutlinedIcon /> },
    roleHome,
    { label: 'Orders', path: '/orders', icon: <ShoppingBagOutlinedIcon /> },
    { label: 'Wallet', path: '/wallet', icon: <SavingsOutlinedIcon /> },
    { label: 'Profile', path: '/profile', icon: <PersonOutlineOutlinedIcon /> },
  ].filter(Boolean);

  const handleMobileNavigate = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          top: 0,
          background: 'linear-gradient(135deg, #d9282f 0%, #ff4b1f 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.14)',
          boxShadow: '0 14px 42px rgba(211,47,47,0.22)',
          borderRadius: { xs: '0 0 18px 18px', md: '0 0 22px 22px' },
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 62, sm: 68, md: 76 },
            gap: { xs: 0.75, sm: 1.25, md: 2 },
            px: { xs: 1, sm: 2, md: 4 },
            flexWrap: 'nowrap !important',
            overflow: 'hidden',
          }}
        >
          <Box
            component={Link}
            to="/home"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 0.75, sm: 1 },
              minWidth: 0,
            }}
          >
            <Avatar
              sx={{
                width: { xs: 36, sm: 38 },
                height: { xs: 36, sm: 38 },
                color: '#d9282f',
                backgroundColor: 'rgba(255,255,255,0.95)',
                boxShadow: '0 8px 18px rgba(0,0,0,0.14)',
                flex: '0 0 auto',
              }}
            >
              <RestaurantMenuOutlinedIcon fontSize="small" />
            </Avatar>
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 900,
                lineHeight: 1,
                fontSize: { xs: '1.05rem', sm: '1.35rem' },
                minWidth: 0,
              }}
            >
              QuickBite
            </Typography>
          </Box>

          <Button
            component={Link}
            to="/home"
            startIcon={<RestaurantMenuOutlinedIcon />}
            sx={{ ...navButtonSx, display: { xs: 'none', md: 'inline-flex' } }}
          >
            Restaurants
          </Button>

          {user ? (
            <Stack
              direction="row"
              alignItems="center"
              spacing={{ xs: 0.35, sm: 0.5, md: 0.75 }}
              sx={{ flexShrink: 0, minWidth: 0 }}
            >
              {user?.role === 'OWNER' && (
              <Button
                component={Link}
                to="/owner"
                startIcon={<DashboardOutlinedIcon />}
                sx={{ ...navButtonSx, display: { xs: 'none', md: 'inline-flex' } }}
              >
                Dashboard
              </Button>
            )}

            {user?.role === 'ADMIN' && (
              <Button
                component={Link}
                to="/admin"
                startIcon={<ShieldOutlinedIcon />}
                sx={{ ...navButtonSx, display: { xs: 'none', md: 'inline-flex' } }}
              >
                Admin
              </Button>
            )}

            {user?.role === 'AGENT' && (
              <Button
                component={Link}
                to="/agent"
                startIcon={<DeliveryDiningOutlinedIcon />}
                sx={{ ...navButtonSx, display: { xs: 'none', md: 'inline-flex' } }}
              >
                Agent
              </Button>
            )}

            <Button
              component={Link}
              to="/orders"
              startIcon={<ShoppingBagOutlinedIcon />}
              sx={{ ...navButtonSx, display: { xs: 'none', md: 'inline-flex' } }}
            >
              Orders
            </Button>

            <NotificationBell />

            <IconButton
              onClick={() => setDrawerOpen(true)}
              aria-label="open cart"
              sx={{
                color: 'white',
                width: { xs: 38, sm: 42 },
                height: { xs: 38, sm: 42 },
                border: '1px solid rgba(255,255,255,0.2)',
                backgroundColor: 'rgba(255,255,255,0.12)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
              }}
            >
              <Badge
                badgeContent={totalItems > 0 ? totalItems : null}
                color="warning"
                max={99}
                overlap="circular"
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{
                  '& .MuiBadge-badge': {
                    top: 2,
                    right: 2,
                    minWidth: 18,
                    height: 18,
                    px: 0.5,
                    fontSize: 11,
                    fontWeight: 900,
                    border: '2px solid #ff4b1f',
                    boxShadow: '0 6px 14px rgba(0,0,0,0.18)',
                    animation: 'none',
                  },
                }}
              >
                <ShoppingCartIcon sx={{ fontSize: { xs: 22, sm: 24 }, display: 'block' }} />
              </Badge>
            </IconButton>

            <Button
              component={Link}
              to="/wallet"
              startIcon={<SavingsOutlinedIcon />}
              sx={{ ...navButtonSx, display: { xs: 'none', md: 'inline-flex' } }}
            >
              Wallet
            </Button>

            <Box
              sx={{
                display: { xs: 'none', lg: 'flex' },
                alignItems: 'center',
                gap: 1,
                px: 1.25,
                py: 0.65,
                borderRadius: 999,
                backgroundColor: 'rgba(255,255,255,0.12)',
                color: 'white',
              }}
            >
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  backgroundColor: 'rgba(255,255,255,0.92)',
                  color: '#d9282f',
                  fontSize: 14,
                  fontWeight: 900,
                }}
              >
                {firstName.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                Hi, {firstName}
              </Typography>
            </Box>

            <Button
              component={Link}
              to="/profile"
              startIcon={<PersonOutlineOutlinedIcon />}
              sx={{ ...navButtonSx, display: { xs: 'none', md: 'inline-flex' } }}
            >
              Profile
            </Button>

            <Button
              variant="outlined"
              size="small"
              onClick={handleLogout}
              startIcon={<LogoutOutlinedIcon />}
              sx={{ ...outlinedButtonSx, display: { xs: 'none', md: 'inline-flex' } }}
            >
              Logout
            </Button>
              <IconButton
                onClick={() => setMobileOpen(true)}
                aria-label="open navigation menu"
                sx={{
                  display: { xs: 'inline-flex', md: 'none' },
                  color: 'white',
                  width: { xs: 38, sm: 42 },
                  height: { xs: 38, sm: 42 },
                  border: '1px solid rgba(255,255,255,0.2)',
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
                }}
              >
                <MenuRoundedIcon />
              </IconButton>
            </Stack>
          ) : (
            <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
              <Button component={Link} to="/login" sx={navButtonSx}>
                Login
              </Button>
              <Button
                variant="outlined"
                component={Link}
                to="/register"
                sx={{ ...outlinedButtonSx, display: { xs: 'none', sm: 'inline-flex' } }}
              >
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '86vw', sm: 360 },
            maxWidth: 380,
            borderRadius: '22px 0 0 22px !important',
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ p: 2.25, minHeight: '100%', bgcolor: '#fff' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
              <Avatar sx={{ bgcolor: '#fff1f2', color: '#d9282f', fontWeight: 900 }}>
                {firstName.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={950} noWrap>{firstName}</Typography>
                <Typography variant="caption" color="text.secondary" noWrap>{user?.role || 'Guest'}</Typography>
              </Box>
            </Stack>
            <IconButton onClick={() => setMobileOpen(false)} aria-label="close menu">
              <CloseRoundedIcon />
            </IconButton>
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          <List disablePadding>
            {mobileItems.map((item) => (
              <ListItemButton
                key={item.path}
                onClick={() => handleMobileNavigate(item.path)}
                sx={{ borderRadius: 2, mb: 0.5, py: 1.25 }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: '#d9282f' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: 900 }}
                />
              </ListItemButton>
            ))}
          </List>

          <Divider sx={{ my: 1.5 }} />

          <Button
            fullWidth
            variant="contained"
            color="error"
            startIcon={<LogoutOutlinedIcon />}
            onClick={handleLogout}
            sx={{ borderRadius: 999, py: 1.15, fontWeight: 900 }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
