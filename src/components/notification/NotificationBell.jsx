// src/components/notification/NotificationBell.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { Badge, IconButton } from '@mui/material';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import notificationApi from '../../api/notificationApi';
import { useAuth } from '../../context/AuthContext';
import NotificationDrawer from './NotificationDrawer';

const NotificationBell = () => {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notificationApi.getUnreadCount();
      setCount(res.data.unreadCount || 0);
    } catch {
      setCount(0);
    }
  }, [user]);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  if (!user) return null;

  return (
    <>
      <IconButton
        onClick={() => setDrawerOpen(true)}
        aria-label="open notifications"
        sx={{
          color: 'white',
          width: { xs: 38, sm: 42 },
          height: { xs: 38, sm: 42 },
          border: '1px solid rgba(255,255,255,0.2)',
          bgcolor: count > 0 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.1)',
          boxShadow: count > 0 ? 'inset 0 0 0 1px rgba(255,255,255,0.08)' : 'none',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' },
        }}
      >
        <Badge
          badgeContent={count > 0 ? count : null}
          color="warning"
          max={99}
          overlap="circular"
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{
            '& .MuiBadge-badge': {
              top: 2,
              right: 2,
              fontWeight: 900,
              minWidth: 18,
              height: 18,
              px: 0.5,
              fontSize: 11,
              border: '2px solid #ff4b1f',
              boxShadow: '0 6px 14px rgba(0,0,0,0.18)',
              animation: 'none',
            },
          }}
        >
          <NotificationsNoneRoundedIcon sx={{ fontSize: { xs: 22, sm: 24 }, display: 'block' }} />
        </Badge>
      </IconButton>

      <NotificationDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          fetchCount();
        }}
      />
    </>
  );
};

export default NotificationBell;
