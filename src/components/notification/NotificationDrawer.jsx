// src/components/notification/NotificationDrawer.jsx
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import TwoWheelerOutlinedIcon from '@mui/icons-material/TwoWheelerOutlined';
import notificationApi from '../../api/notificationApi';

const TYPE_META = {
  ORDER: {
    label: 'Order',
    color: '#d9282f',
    bg: '#fff1f1',
    icon: <ReceiptLongOutlinedIcon />,
  },
  PAYMENT: {
    label: 'Payment',
    color: '#168039',
    bg: '#f0fdf4',
    icon: <PaymentsOutlinedIcon />,
  },
  DELIVERY: {
    label: 'Delivery',
    color: '#2563eb',
    bg: '#eff6ff',
    icon: <TwoWheelerOutlinedIcon />,
  },
  PROMO: {
    label: 'Promo',
    color: '#b45309',
    bg: '#fff7ed',
    icon: <LocalOfferOutlinedIcon />,
  },
  DEFAULT: {
    label: 'Notice',
    color: '#6b7280',
    bg: '#f3f4f6',
    icon: <CampaignOutlinedIcon />,
  },
};

const NotificationDrawer = ({ open, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await notificationApi.getMyNotifications();
      setNotifications(res.data);
    } catch {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.notificationId === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch {
      // silent fail
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
    } catch {
      // silent fail
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationApi.deleteNotification(id);
      setNotifications((prev) =>
        prev.filter((notification) => notification.notificationId !== id)
      );
    } catch {
      // silent fail
    }
  };

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const formatTime = (sentAt) => {
    const date = new Date(sentAt);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60);

    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString('en-IN');
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 460 },
          borderRadius: { xs: 0, sm: '28px 0 0 28px' },
          overflow: 'hidden',
          bgcolor: '#f7f8fb',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box
          sx={{
            p: 2.5,
            color: '#fff',
            background: 'linear-gradient(135deg, #d9282f 0%, #ff4b1f 100%)',
            boxShadow: '0 16px 44px rgba(217,40,47,0.24)',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff' }}>
                <NotificationsNoneRoundedIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={900}>
                  Notifications
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.86 }}>
                  {unreadCount > 0
                    ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}`
                    : 'All caught up'}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={0.5}>
              {unreadCount > 0 && (
                <IconButton
                  size="small"
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                  sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.14)' }}
                >
                  <DoneAllRoundedIcon fontSize="small" />
                </IconButton>
              )}
              <IconButton
                onClick={onClose}
                sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.14)' }}
              >
                <CloseIcon />
              </IconButton>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Chip
              label={`${notifications.length} total`}
              sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 900 }}
            />
            {unreadCount > 0 && (
              <Chip label={`${unreadCount} new`} sx={{ bgcolor: '#fff', color: '#d9282f', fontWeight: 900 }} />
            )}
          </Stack>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
              <CircularProgress color="error" size={32} />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : notifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Avatar sx={{ width: 72, height: 72, mx: 'auto', mb: 2, bgcolor: '#fff', color: '#d9282f' }}>
                <NotificationsNoneRoundedIcon fontSize="large" />
              </Avatar>
              <Typography variant="h6" fontWeight={900}>
                No notifications yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Order and delivery updates will appear here.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {notifications.map((notification) => {
                const meta = TYPE_META[notification.type] || TYPE_META.DEFAULT;
                const unread = !notification.isRead;

                return (
                  <Box
                    key={notification.notificationId}
                    onClick={() => {
                      if (unread) handleMarkRead(notification.notificationId);
                    }}
                    sx={{
                      p: 1.75,
                      borderRadius: 3,
                      cursor: unread ? 'pointer' : 'default',
                      bgcolor: unread ? '#fff' : 'rgba(255,255,255,0.78)',
                      border: unread
                        ? `1px solid ${meta.color}22`
                        : '1px solid rgba(20,24,35,0.07)',
                      boxShadow: unread
                        ? '0 14px 36px rgba(24,28,42,0.1)'
                        : '0 8px 24px rgba(24,28,42,0.05)',
                    }}
                  >
                    <Stack direction="row" spacing={1.4} alignItems="flex-start">
                      <Avatar
                        sx={{
                          width: 42,
                          height: 42,
                          bgcolor: meta.bg,
                          color: meta.color,
                          flexShrink: 0,
                        }}
                      >
                        {meta.icon}
                      </Avatar>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="subtitle1" fontWeight={unread ? 900 : 800} noWrap>
                            {notification.title}
                          </Typography>
                          {unread && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: '#d9282f',
                                flexShrink: 0,
                                boxShadow: '0 0 0 4px rgba(217,40,47,0.1)',
                              }}
                            />
                          )}
                        </Stack>

                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                          {notification.message}
                        </Typography>

                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                          <Chip
                            label={meta.label}
                            size="small"
                            sx={{
                              height: 22,
                              bgcolor: meta.bg,
                              color: meta.color,
                              fontWeight: 900,
                              borderRadius: 999,
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(notification.sentAt)}
                          </Typography>
                        </Stack>
                      </Box>

                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.notificationId);
                        }}
                        sx={{
                          color: 'text.disabled',
                          '&:hover': { color: '#d9282f', bgcolor: '#fff1f1' },
                        }}
                      >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>

        {notifications.length > 0 && (
          <Box sx={{ p: 2, borderTop: '1px solid rgba(20,24,35,0.08)', bgcolor: '#fff' }}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<DoneAllRoundedIcon />}
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              sx={{ borderRadius: 999, fontWeight: 900 }}
            >
              Mark all as read
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default NotificationDrawer;
