// src/App.js — complete final version
import React from 'react';
import { BrowserRouter as Router,
         Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }       from './context/AuthContext';
import { CartProvider }       from './context/CartContext';
import Navbar                 from './components/Navbar';
import CartDrawer             from './components/cart/CartDrawer';
import DifferentRestaurantDialog
  from './components/cart/DifferentRestaurantDialog';

// Auth
import Login     from './pages/Login';
import Register  from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';

// Core
import Home              from './pages/Home';
import RestaurantDetail  from './pages/RestaurantDetail';
import Checkout          from './pages/Checkout';
import Payment           from './pages/Payment';
import Wallet            from './pages/Wallet';

// Orders
import OrderHistory  from './pages/OrderHistory';
import OrderDetail   from './pages/OrderDetail';

// Delivery
import DeliveryTracking from './pages/DeliveryTracking';

// Owner
import OwnerDashboard from './pages/owner/OwnerDashboard';
import MyRestaurants  from './pages/owner/MyRestaurants';
import ManageMenu     from './pages/owner/ManageMenu';
import IncomingOrders from './pages/owner/IncomingOrders';

// Admin
import AdminDashboard     from './pages/admin/AdminDashboard';
import ApproveRestaurants
  from './pages/admin/ApproveRestaurants';
import ManageUsers    from './pages/admin/ManageUsers';
import AllOrders      from './pages/admin/AllOrders';
import PlatformAnalytics
  from './pages/admin/PlatformAnalytics';

// Agent
import AgentDashboard from './pages/agent/AgentDashboard';
import AgentOrders    from './pages/agent/AgentOrders';
import AgentLocation  from './pages/agent/AgentLocation';
import AgentRegister  from './pages/agent/AgentRegister';
import AgentEarnings  from './pages/agent/AgentEarnings';

// New pages
import Profile           from './pages/Profile';
import EarningsAnalytics from './pages/owner/EarningsAnalytics';
import OwnerReviews      from './pages/owner/OwnerReviews';
import VerifyAgents      from './pages/admin/VerifyAgents';
import ReviewModeration  from './pages/admin/ReviewModeration';

import ProtectedRoute from './routes/ProtectedRoute';
import { Box, Typography } from '@mui/material';
import { useAuth } from './context/AuthContext';
import { getRoleHomePath } from './utils/roleRoutes';

const DashboardRedirect = () => {
  const { user } = useAuth();
  return <Navigate to={getRoleHomePath(user?.role)} replace />;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Navbar />
          <CartDrawer />
          <DifferentRestaurantDialog />
          <Routes>

            {/* ── Public ── */}
            <Route path="/login"
                   element={<Login />} />
            <Route path="/forgot-password"
                   element={<ForgotPassword />} />
            <Route path="/reset-password"
                   element={<ResetPassword />} />
            <Route path="/oauth2/redirect"
                   element={<OAuth2RedirectHandler />} />
            <Route path="/register"
                   element={<Register />} />
            <Route path="/home"
                   element={<Home />} />
            <Route path="/restaurant/:id"
                   element={<RestaurantDetail />} />

            {/* ── Customer Protected ── */}
            <Route path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route path="/payment"
              element={
                <ProtectedRoute>
                  <Payment />
                </ProtectedRoute>
              }
            />
            <Route path="/wallet"
              element={
                <ProtectedRoute>
                  <Wallet />
                </ProtectedRoute>
              }
            />
            <Route path="/orders"
              element={
                <ProtectedRoute>
                  <OrderHistory />
                </ProtectedRoute>
              }
            />
            <Route path="/orders/:id"
              element={
                <ProtectedRoute>
                  <OrderDetail />
                </ProtectedRoute>
              }
            />
            <Route path="/delivery/track/:orderId"
              element={
                <ProtectedRoute>
                  <DeliveryTracking />
                </ProtectedRoute>
              }
            />
            <Route path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              }
            />

            {/* ── Owner Routes ── */}
            <Route path="/owner"
              element={
                <ProtectedRoute
                  allowedRoles={['OWNER']}>
                  <OwnerDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/owner/restaurants"
              element={
                <ProtectedRoute
                  allowedRoles={['OWNER']}>
                  <MyRestaurants />
                </ProtectedRoute>
              }
            />
            <Route path="/owner/menu"
              element={
                <ProtectedRoute
                  allowedRoles={['OWNER']}>
                  <ManageMenu />
                </ProtectedRoute>
              }
            />
            <Route path="/owner/orders"
              element={
                <ProtectedRoute
                  allowedRoles={['OWNER']}>
                  <IncomingOrders />
                </ProtectedRoute>
              }
            />
            <Route path="/owner/earnings"
              element={
                <ProtectedRoute
                  allowedRoles={['OWNER']}>
                  <EarningsAnalytics />
                </ProtectedRoute>
              }
            />
            <Route path="/owner/reviews"
              element={
                <ProtectedRoute
                  allowedRoles={['OWNER']}>
                  <OwnerReviews />
                </ProtectedRoute>
              }
            />

            {/* ── Admin Routes ── */}
            <Route path="/admin"
              element={
                <ProtectedRoute
                  allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/restaurants"
              element={
                <ProtectedRoute
                  allowedRoles={['ADMIN']}>
                  <ApproveRestaurants />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/users"
              element={
                <ProtectedRoute
                  allowedRoles={['ADMIN']}>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/orders"
              element={
                <ProtectedRoute
                  allowedRoles={['ADMIN']}>
                  <AllOrders />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/analytics"
              element={
                <ProtectedRoute
                  allowedRoles={['ADMIN']}>
                  <PlatformAnalytics />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/agents"
              element={
                <ProtectedRoute
                  allowedRoles={['ADMIN']}>
                  <VerifyAgents />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/reviews"
              element={
                <ProtectedRoute
                  allowedRoles={['ADMIN']}>
                  <ReviewModeration />
                </ProtectedRoute>
              }
            />

            {/* ── Agent Routes ── */}
            <Route path="/agent"
              element={
                <ProtectedRoute
                  allowedRoles={['AGENT']}>
                  <AgentDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/agent/orders"
              element={
                <ProtectedRoute
                  allowedRoles={['AGENT']}>
                  <AgentOrders />
                </ProtectedRoute>
              }
            />
            <Route path="/agent/location"
              element={
                <ProtectedRoute
                  allowedRoles={['AGENT']}>
                  <AgentLocation />
                </ProtectedRoute>
              }
            />
            <Route path="/agent/register"
              element={
                <ProtectedRoute
                  allowedRoles={['AGENT']}>
                  <AgentRegister />
                </ProtectedRoute>
              }
            />
            <Route path="/agent/earnings"
              element={
                <ProtectedRoute
                  allowedRoles={['AGENT']}>
                  <AgentEarnings />
                </ProtectedRoute>
              }
            />

            {/* ── Profile (all logged-in users) ── */}
            <Route path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* ── Misc ── */}
            <Route path="/unauthorized"
              element={
                <Box sx={{ p: 4,
                           textAlign: 'center' }}>
                  <Typography variant="h5"
                              color="error">
                    ⛔ Access Denied
                  </Typography>
                </Box>
              }
            />
            <Route path="/"
                   element={<Navigate to="/home" />} />
            <Route path="*"
                   element={<Navigate to="/home" />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
