import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { getRoleHomePath } from '../utils/roleRoutes';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1';

const decodeJwtPayload = (token) => {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(normalized));
  } catch {
    return {};
  }
};

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveSession } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const completeOAuthLogin = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const err = params.get('error');

      if (token) {
        localStorage.setItem('token', token);
        let oauthUser = null;

        try {
          const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Profile lookup failed');
          }
          oauthUser = await response.json();
          saveSession(token, oauthUser);
        } catch {
          const claims = decodeJwtPayload(token);
          oauthUser = {
            email: claims.sub || '',
            fullName: claims.sub || 'QuickBite User',
            role: claims.role || 'CUSTOMER',
            userId: claims.userId || null,
            phone: '',
          };
          saveSession(token, oauthUser);
        }

        navigate(getRoleHomePath(oauthUser?.role), { replace: true });
      } else if (err) {
        setError('OAuth2 login failed: ' + err);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError('Invalid OAuth2 callback. No token found.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    completeOAuthLogin();
  }, [location, navigate, saveSession]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      {error ? (
        <Typography color="error" variant="h6">{error}</Typography>
      ) : (
        <>
          <CircularProgress size={60} color="error" sx={{ mb: 2 }} />
          <Typography variant="h6">Completing login...</Typography>
        </>
      )}
    </Box>
  );
};

export default OAuth2RedirectHandler;
