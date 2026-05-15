// src/pages/admin/ManageUsers.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PersonIcon from '@mui/icons-material/Person';
import axiosInstance from '../../api/axiosInstance';
import AppSnackbar from '../../components/common/AppSnackbar';

const ROLE_COLOR = {
  CUSTOMER: 'primary',
  OWNER: 'warning',
  AGENT: 'info',
  ADMIN: 'error',
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get('/auth/admin/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('Failed to load users. Check if GET /auth/admin/users is accessible.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (userId) => {
    try {
      await axiosInstance.put(`/auth/admin/users/${userId}/suspend`);
      setSnack({ open: true, message: 'User suspended', severity: 'success' });
      fetchUsers();
    } catch {
      setSnack({ open: true, message: 'Failed to suspend user', severity: 'error' });
    }
  };

  const handleActivate = async (userId) => {
    try {
      await axiosInstance.put(`/auth/admin/users/${userId}/activate`);
      setSnack({ open: true, message: 'User activated', severity: 'success' });
      fetchUsers();
    } catch {
      setSnack({ open: true, message: 'Failed to activate user', severity: 'error' });
    }
  };

  const handleDelete = async (userId) => {
    try {
      await axiosInstance.delete(`/auth/admin/users/${userId}`);
      setSnack({ open: true, message: 'User deleted', severity: 'success' });
      fetchUsers();
    } catch {
      setSnack({ open: true, message: 'Failed to delete user', severity: 'error' });
    }
    setConfirm(null);
  };

  const summary = useMemo(() => ({
    total: users.length,
    active: users.filter((user) => user.isActive).length,
    suspended: users.filter((user) => !user.isActive).length,
    admins: users.filter((user) => user.role === 'ADMIN').length,
  }), [users]);

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 3, md: 5 }, background: 'linear-gradient(180deg, rgba(255,247,242,0.9) 0%, #f7f8fb 340px, #f7f8fb 100%)' }}>
      <Container maxWidth="xl">
        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, mb: 3, borderRadius: 4, color: '#fff', background: 'linear-gradient(135deg, #d9282f 0%, #ff4b1f 100%)', boxShadow: '0 22px 64px rgba(217,40,47,0.22)' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.18)' }}><PeopleAltOutlinedIcon fontSize="large" /></Avatar>
            <Box>
              <Typography variant="h4" fontWeight={950}>Manage Users</Typography>
              <Typography sx={{ opacity: 0.86 }}>Review accounts, roles, access status, and moderation actions.</Typography>
            </Box>
          </Stack>
        </Paper>

        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {[
            ['Total Users', summary.total, '#d9282f'],
            ['Active', summary.active, '#16a34a'],
            ['Suspended', summary.suspended, '#f97316'],
            ['Admins', summary.admins, '#2563eb'],
          ].map(([label, value, color]) => (
            <Grid item xs={12} sm={6} md={3} key={label}>
              <Paper elevation={0} sx={{ p: 2.25, borderRadius: 4, border: '1px solid rgba(20,24,35,0.08)', boxShadow: '0 14px 42px rgba(24,28,42,0.06)' }}>
                <Typography variant="body2" color="text.secondary" fontWeight={800}>{label}</Typography>
                <Typography variant="h4" fontWeight={950} sx={{ color }}>{value}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="error" />
          </Box>
        ) : users.length === 0 ? (
          <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>
            <Typography color="text.secondary">No users found.</Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid rgba(20,24,35,0.08)', boxShadow: '0 18px 54px rgba(24,28,42,0.08)', overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#111827' }}>
                  {['User', 'Email', 'Phone', 'Role', 'Status', 'Actions'].map((header) => (
                    <TableCell key={header} sx={{ color: '#fff', fontWeight: 900 }}>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.userId} hover sx={{ '& td': { borderColor: 'rgba(20,24,35,0.07)' } }}>
                    <TableCell>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Avatar sx={{ bgcolor: '#fff7ed', color: '#d9282f' }}><PersonIcon /></Avatar>
                        <Box>
                          <Typography fontWeight={900}>{user.fullName}</Typography>
                          <Typography variant="caption" color="text.secondary">ID #{user.userId}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell><Chip label={user.role} color={ROLE_COLOR[user.role] || 'default'} size="small" sx={{ borderRadius: 999, fontWeight: 900 }} /></TableCell>
                    <TableCell><Chip label={user.isActive ? 'Active' : 'Suspended'} color={user.isActive ? 'success' : 'default'} size="small" sx={{ borderRadius: 999, fontWeight: 900 }} /></TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {user.isActive ? (
                          <Button size="small" variant="outlined" color="warning" startIcon={<BlockIcon />} onClick={() => handleSuspend(user.userId)} disabled={user.role === 'ADMIN'} sx={{ borderRadius: 999, fontWeight: 900 }}>
                            Suspend
                          </Button>
                        ) : (
                          <Button size="small" variant="outlined" color="success" startIcon={<CheckCircleIcon />} onClick={() => handleActivate(user.userId)} sx={{ borderRadius: 999, fontWeight: 900 }}>
                            Activate
                          </Button>
                        )}
                        <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon />} disabled={user.role === 'ADMIN'} onClick={() => setConfirm({ userId: user.userId, name: user.fullName })} sx={{ borderRadius: 999, fontWeight: 900 }}>
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog open={Boolean(confirm)} onClose={() => setConfirm(null)} PaperProps={{ sx: { borderRadius: 4 } }}>
          <DialogTitle fontWeight={950}>Delete User?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to permanently delete <strong>{confirm?.name}</strong>? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setConfirm(null)} sx={{ borderRadius: 999, fontWeight: 800 }}>Cancel</Button>
            <Button variant="contained" color="error" onClick={() => handleDelete(confirm.userId)} startIcon={<DeleteIcon />} sx={{ borderRadius: 999, fontWeight: 900 }}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <AppSnackbar
          open={snack.open}
          message={snack.message}
          severity={snack.severity}
          onClose={() => setSnack((current) => ({ ...current, open: false }))}
        />
      </Container>
    </Box>
  );
};

export default ManageUsers;
