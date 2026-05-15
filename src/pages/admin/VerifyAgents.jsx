// src/pages/admin/VerifyAgents.jsx
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import VerifiedIcon from '@mui/icons-material/Verified';
import deliveryApi from '../../api/deliveryApi';
import AppSnackbar from '../../components/common/AppSnackbar';

const VerifyAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  const [rejectingAgent, setRejectingAgent] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await deliveryApi.getAllAgents();
      setAgents(res.data);
    } catch {
      setError('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (agentId) => {
    try {
      await deliveryApi.verifyAgent(agentId);
      setSnack({ open: true, message: 'Agent verified successfully', severity: 'success' });
      await fetchAgents();
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || 'Failed to verify agent', severity: 'error' });
    }
  };

  const handleReject = async () => {
    if (!rejectingAgent) return;
    try {
      await deliveryApi.rejectAgent(rejectingAgent.agentId);
      setRejectingAgent(null);
      setSnack({ open: true, message: rejectingAgent.isVerified ? 'Agent deactivated' : 'Agent rejected', severity: 'success' });
      await fetchAgents();
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || 'Failed to reject agent', severity: 'error' });
    }
  };

  const isActive = (agent) => agent.isActive !== false;
  const unverified = agents.filter((agent) => isActive(agent) && !agent.isVerified);
  const verified = agents.filter((agent) => isActive(agent) && agent.isVerified);
  const rejected = agents.filter((agent) => !isActive(agent));
  const display = tab === 0 ? unverified : tab === 1 ? verified : rejected;

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 3, md: 5 }, background: 'linear-gradient(180deg, rgba(255,247,242,0.9) 0%, #f7f8fb 360px, #f7f8fb 100%)' }}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, mb: 3, borderRadius: 4, color: '#fff', background: 'linear-gradient(135deg, #d9282f 0%, #ff4b1f 100%)', boxShadow: '0 22px 64px rgba(217,40,47,0.24)' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: 62, height: 62, bgcolor: 'rgba(255,255,255,0.18)' }}><TwoWheelerIcon fontSize="large" /></Avatar>
            <Box>
              <Typography variant="h4" fontWeight={900}>Delivery Agent Verification</Typography>
              <Typography variant="body1" sx={{ opacity: 0.88 }}>Review agent identity, vehicle details, and verification status.</Typography>
            </Box>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: 1, mb: 3, borderRadius: 999, display: 'inline-flex', border: '1px solid rgba(20,24,35,0.08)' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="error" indicatorColor="error" sx={{ minHeight: 42, '& .MuiTabs-indicator': { display: 'none' }, '& .MuiTab-root': { minHeight: 42, borderRadius: 999, px: 2.5, fontWeight: 900 }, '& .Mui-selected': { bgcolor: 'rgba(217,40,47,0.1)' } }}>
            <Tab label={`Pending (${unverified.length})`} />
            <Tab label={`Verified (${verified.length})`} />
            <Tab label={`Rejected (${rejected.length})`} />
          </Tabs>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress color="error" /></Box>
        ) : display.length === 0 ? (
          <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={900}>{tab === 0 ? 'No pending verifications' : tab === 1 ? 'No verified agents yet' : 'No rejected agents'}</Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {display.map((agent) => (
              <Grid item xs={12} sm={6} md={4} key={agent.agentId}>
                <Card sx={{ borderRadius: 4, border: '1px solid rgba(20,24,35,0.08)', boxShadow: '0 16px 48px rgba(24,28,42,0.08)', height: '100%' }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Avatar sx={{ bgcolor: agent.isVerified ? '#f0fdf4' : '#fff7ed', color: agent.isVerified ? '#168039' : '#ea580c' }}>
                          <TwoWheelerIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={900}>{agent.fullName}</Typography>
                          <Typography variant="caption" color="text.secondary">Status: {agent.status}</Typography>
                        </Box>
                      </Stack>
                      <Chip
                        label={agent.isVerified ? 'Verified' : agent.isActive === false ? 'Rejected' : 'Pending'}
                        color={agent.isVerified ? 'success' : agent.isActive === false ? 'error' : 'warning'}
                        icon={agent.isVerified ? <VerifiedIcon /> : undefined}
                        sx={{ fontWeight: 900, borderRadius: 999 }}
                      />
                    </Stack>

                    <Stack spacing={1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LocalPhoneOutlinedIcon color="action" fontSize="small" />
                        <Typography variant="body2">{agent.phone}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <BadgeOutlinedIcon color="action" fontSize="small" />
                        <Typography variant="body2">{agent.vehicleType} - {agent.vehicleNumber}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <StarRoundedIcon color="warning" fontSize="small" />
                        <Typography variant="body2">{agent.totalDeliveries} deliveries - {agent.avgRating?.toFixed(1)} rating</Typography>
                      </Stack>
                    </Stack>

                    {isActive(agent) && (
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ mt: 2.5 }}>
                        {!agent.isVerified && (
                          <Button fullWidth variant="contained" color="success" startIcon={<CheckCircleIcon />} sx={{ borderRadius: 999, fontWeight: 900 }} onClick={() => handleVerify(agent.agentId)}>
                            Verify
                          </Button>
                        )}
                        <Button fullWidth variant="outlined" color="error" startIcon={<CancelRoundedIcon />} sx={{ borderRadius: 999, fontWeight: 900 }} onClick={() => setRejectingAgent(agent)}>
                          {agent.isVerified ? 'Deactivate' : 'Reject'}
                        </Button>
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Dialog open={Boolean(rejectingAgent)} onClose={() => setRejectingAgent(null)} PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
          <DialogTitle sx={{ fontWeight: 900 }}>Reject Agent?</DialogTitle>
          <DialogContent>
            <Typography color="text.secondary">
              {rejectingAgent?.fullName} will be marked inactive and removed from active verification lists.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setRejectingAgent(null)} sx={{ borderRadius: 999, fontWeight: 800 }}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleReject} startIcon={<CancelRoundedIcon />} sx={{ borderRadius: 999, fontWeight: 900 }}>
              {rejectingAgent?.isVerified ? 'Deactivate Agent' : 'Reject Agent'}
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

export default VerifyAgents;
