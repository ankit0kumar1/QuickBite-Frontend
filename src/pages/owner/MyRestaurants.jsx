// src/pages/owner/MyRestaurants.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
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
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import StorefrontIcon from '@mui/icons-material/Storefront';
import restaurantApi from '../../api/restaurantApi';
import AppSnackbar from '../../components/common/AppSnackbar';
import LocationPicker from '../../components/restaurant/LocationPicker';

const initialForm = {
  name: '',
  description: '',
  cuisine: '',
  address: '',
  city: '',
  latitude: '',
  longitude: '',
  phone: '',
  deliveryRadius: 5,
  minOrderAmount: 100,
  estimatedDeliveryMin: 30,
  openingHours: '9AM - 11PM',
  imageUrl: '',
};

const MyRestaurants = () => {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchMyRestaurants();
  }, []);

  const fetchMyRestaurants = async () => {
    setLoading(true);
    try {
      const res = await restaurantApi.getMyRestaurants();
      setRestaurants(res.data);
    } catch {
      setError('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const openAddDialog = () => {
    setFormError('');
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (restaurant) => {
    setFormError('');
    setEditingId(restaurant.restaurantId);
    setForm({
      name: restaurant.name || '',
      description: restaurant.description || '',
      cuisine: restaurant.cuisine || '',
      address: restaurant.address || '',
      city: restaurant.city || '',
      latitude: restaurant.latitude ?? '',
      longitude: restaurant.longitude ?? '',
      phone: restaurant.phone || '',
      deliveryRadius: restaurant.deliveryRadius ?? 5,
      minOrderAmount: restaurant.minOrderAmount ?? 100,
      estimatedDeliveryMin: restaurant.estimatedDeliveryMin ?? 30,
      openingHours: restaurant.openingHours || '9AM - 11PM',
      imageUrl: restaurant.imageUrl || '',
    });
    setDialogOpen(true);
  };

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleLocationChange = (lat, lng) => {
    setForm((current) => ({ ...current, latitude: lat, longitude: lng }));
  };

  const handleSubmit = async () => {
    setFormError('');

    if (!form.latitude || !form.longitude) {
      setFormError('Please set the restaurant location using the map, search, or GPS.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        deliveryRadius: parseFloat(form.deliveryRadius),
        minOrderAmount: parseFloat(form.minOrderAmount),
        estimatedDeliveryMin: parseInt(form.estimatedDeliveryMin, 10),
      };

      if (editingId) {
        await restaurantApi.update(editingId, payload);
      } else {
        await restaurantApi.register(payload);
      }

      setDialogOpen(false);
      setSnack({ open: true, message: editingId ? 'Restaurant updated' : 'Restaurant submitted', severity: 'success' });
      resetForm();
      fetchMyRestaurants();
    } catch (err) {
      setFormError(err.response?.data?.message || `Failed to ${editingId ? 'update' : 'register'} restaurant`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await restaurantApi.toggleOpen(id);
      setSnack({ open: true, message: 'Restaurant status updated', severity: 'success' });
      fetchMyRestaurants();
    } catch {
      setSnack({ open: true, message: 'Failed to toggle restaurant status', severity: 'error' });
    }
  };

  const approvedCount = restaurants.filter((restaurant) => restaurant.isApproved).length;
  const openCount = restaurants.filter((restaurant) => restaurant.isOpen).length;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f8fb', py: { xs: 3, md: 4 } }}>
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Chip icon={<StorefrontIcon />} label="Restaurant portfolio" sx={{ mb: 1, bgcolor: '#fff1f2', color: '#b91c1c', fontWeight: 900, borderRadius: 999 }} />
            <Typography variant="h4" fontWeight={950} color="#171827">
              My Restaurants
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Review approvals, update store details, and jump into menu management.
            </Typography>
          </Box>
          <Button variant="contained" color="error" startIcon={<AddBusinessIcon />} onClick={openAddDialog} sx={{ borderRadius: 999, px: 2.5, py: 1.1, fontWeight: 900 }}>
            Add Restaurant
          </Button>
        </Stack>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            ['Total', restaurants.length],
            ['Approved', approvedCount],
            ['Open now', openCount],
          ].map(([label, value]) => (
            <Grid item xs={12} sm={4} key={label}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(20,24,35,0.08)' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={900}>{label}</Typography>
                <Typography variant="h5" fontWeight={950}>{value}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="error" />
          </Box>
        ) : restaurants.length === 0 ? (
          <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: 2, border: '1px dashed rgba(211,47,47,0.35)', bgcolor: '#fff' }}>
            <RestaurantIcon sx={{ fontSize: 52, color: '#d32f2f', mb: 1 }} />
            <Typography variant="h6" fontWeight={950}>No restaurants yet</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
              Add your first restaurant to start creating categories and menu items.
            </Typography>
            <Button variant="contained" color="error" startIcon={<AddBusinessIcon />} onClick={openAddDialog} sx={{ borderRadius: 999, fontWeight: 900 }}>
              Add Restaurant
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={2.5}>
            {restaurants.map((restaurant) => (
              <Grid item xs={12} md={6} lg={4} key={restaurant.restaurantId}>
                <Card elevation={0} sx={{ height: '100%', borderRadius: 2, border: '1px solid rgba(20,24,35,0.08)', boxShadow: '0 16px 42px rgba(24,28,42,0.07)' }}>
                  <CardContent sx={{ p: 2.25 }}>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="h6" fontWeight={950} color="#24242b" noWrap>{restaurant.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{restaurant.cuisine || 'Cuisine'} in {restaurant.city || 'City'}</Typography>
                        </Box>
                        <Chip label={restaurant.isApproved ? 'Approved' : 'Pending'} color={restaurant.isApproved ? 'success' : 'warning'} size="small" sx={{ fontWeight: 900, borderRadius: 999 }} />
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <LocationOnOutlinedIcon color="action" fontSize="small" />
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>{restaurant.address || 'No address provided'}</Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip label={restaurant.isOpen ? 'Open' : 'Closed'} color={restaurant.isOpen ? 'success' : 'default'} size="small" sx={{ fontWeight: 900, borderRadius: 999 }} />
                        <Chip label={`${restaurant.estimatedDeliveryMin || 30} min delivery`} size="small" sx={{ fontWeight: 800, borderRadius: 999 }} />
                        <Chip label={`Min Rs.${restaurant.minOrderAmount || 0}`} size="small" sx={{ fontWeight: 800, borderRadius: 999 }} />
                      </Stack>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
                        <Button size="small" variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => openEditDialog(restaurant)} sx={{ borderRadius: 999, fontWeight: 900 }}>
                          Edit
                        </Button>
                        <Button size="small" variant="contained" color="error" startIcon={<MenuBookOutlinedIcon />} onClick={() => navigate(`/owner/menu?restaurantId=${restaurant.restaurantId}&name=${encodeURIComponent(restaurant.name)}`)} sx={{ borderRadius: 999, fontWeight: 900 }}>
                          Menu
                        </Button>
                        <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-end', sm: 'center' } }}>
                          <IconButton size="small" onClick={() => handleToggle(restaurant.restaurantId)} color={restaurant.isOpen ? 'success' : 'default'} aria-label="Toggle restaurant open status">
                            <PowerSettingsNewIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setFormError(''); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
          <DialogTitle fontWeight={950}>{editingId ? 'Edit Restaurant' : 'Add New Restaurant'}</DialogTitle>
          <DialogContent>
            {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
            {[
              { name: 'name', label: 'Restaurant Name' },
              { name: 'description', label: 'Description' },
              { name: 'cuisine', label: 'Cuisine Type' },
              { name: 'address', label: 'Address' },
              { name: 'city', label: 'City' },
              { name: 'phone', label: 'Phone' },
            ].map((field) => (
              <TextField key={field.name} fullWidth label={field.label} name={field.name} value={form[field.name]} onChange={handleChange} margin="dense" size="small" />
            ))}

            <LocationPicker latitude={form.latitude} longitude={form.longitude} onLocationChange={handleLocationChange} address={form.address} city={form.city} />

            <TextField fullWidth label="Opening Hours" name="openingHours" value={form.openingHours} onChange={handleChange} margin="dense" size="small" />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
              <TextField fullWidth label="Delivery Radius (km)" name="deliveryRadius" type="number" value={form.deliveryRadius} onChange={handleChange} margin="dense" size="small" />
              <TextField fullWidth label="Min Order Amount" name="minOrderAmount" type="number" value={form.minOrderAmount} onChange={handleChange} margin="dense" size="small" />
            </Stack>
            <TextField fullWidth label="Estimated Delivery Time (min)" name="estimatedDeliveryMin" type="number" value={form.estimatedDeliveryMin} onChange={handleChange} margin="dense" size="small" />
            <TextField fullWidth label="Cover Image URL (optional)" name="imageUrl" value={form.imageUrl} onChange={handleChange} margin="dense" size="small" placeholder="https://example.com/image.jpg" />
            {form.imageUrl && (
              <Box sx={{ mt: 1, textAlign: 'center' }}>
                <img src={form.imageUrl} alt="preview" style={{ maxHeight: 120, borderRadius: 8, objectFit: 'cover', maxWidth: '100%' }} onError={(event) => { event.target.style.display = 'none'; }} />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => { setDialogOpen(false); setFormError(''); }}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleSubmit} disabled={submitting} sx={{ borderRadius: 999, fontWeight: 900 }}>
              {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Add Restaurant'}
            </Button>
          </DialogActions>
        </Dialog>

        <AppSnackbar open={snack.open} message={snack.message} severity={snack.severity} onClose={() => setSnack((current) => ({ ...current, open: false }))} />
      </Container>
    </Box>
  );
};

export default MyRestaurants;
