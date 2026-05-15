// src/pages/owner/ManageMenu.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import StorefrontIcon from '@mui/icons-material/Storefront';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import menuApi from '../../api/menuApi';
import AppSnackbar from '../../components/common/AppSnackbar';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const ManageMenu = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get('restaurantId');
  const restaurantName = searchParams.get('name');

  const [tab, setTab] = useState(0);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [catDialog, setCatDialog] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', description: '', displayOrder: 0 });
  const [editCatId, setEditCatId] = useState(null);
  const [itemDialog, setItemDialog] = useState(false);
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    discountedPrice: '',
    categoryId: '',
    isVeg: true,
    isAvailable: true,
    calories: '',
    tags: '',
    imageUrl: '',
  });
  const [editItemId, setEditItemId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (restaurantId) fetchMenu();
  }, [restaurantId]);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const [catRes, itemRes] = await Promise.all([
        menuApi.getCategoriesByRestaurant(restaurantId),
        menuApi.getItemsByRestaurant(restaurantId),
      ]);
      setCategories(catRes.data);
      setItems(itemRes.data);
    } catch {
      setError('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const openAddCategory = () => {
    setEditCatId(null);
    setCatForm({ name: '', description: '', displayOrder: categories.length + 1 });
    setCatDialog(true);
  };

  const openEditCategory = (cat) => {
    setEditCatId(cat.categoryId);
    setCatForm({ name: cat.name, description: cat.description || '', displayOrder: cat.displayOrder });
    setCatDialog(true);
  };

  const handleSaveCategory = async () => {
    setSubmitting(true);
    try {
      const payload = { ...catForm, restaurantId: parseInt(restaurantId, 10) };
      if (editCatId) await menuApi.updateCategory(editCatId, payload);
      else await menuApi.addCategory(payload);
      setCatDialog(false);
      setSnack({ open: true, message: editCatId ? 'Category updated' : 'Category added', severity: 'success' });
      fetchMenu();
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || 'Failed to save category', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await menuApi.deleteCategory(id);
      setConfirmDelete(null);
      setSnack({ open: true, message: 'Category deleted', severity: 'success' });
      fetchMenu();
    } catch {
      setSnack({ open: true, message: 'Failed to delete category', severity: 'error' });
    }
  };

  const openAddItem = () => {
    setEditItemId(null);
    setItemForm({
      name: '',
      description: '',
      price: '',
      discountedPrice: '',
      categoryId: categories[0]?.categoryId || '',
      isVeg: true,
      isAvailable: true,
      calories: '',
      tags: '',
      imageUrl: '',
    });
    setItemDialog(true);
  };

  const openEditItem = (item) => {
    setEditItemId(item.itemId);
    setItemForm({
      name: item.name,
      description: item.description || '',
      price: item.price,
      discountedPrice: item.discountedPrice || '',
      categoryId: item.categoryId,
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      calories: item.calories || '',
      tags: item.tags || '',
      imageUrl: item.imageUrl || '',
    });
    setItemDialog(true);
  };

  const handleSaveItem = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ...itemForm,
        restaurantId: parseInt(restaurantId, 10),
        price: parseFloat(itemForm.price),
        discountedPrice: itemForm.discountedPrice ? parseFloat(itemForm.discountedPrice) : null,
        calories: itemForm.calories ? parseInt(itemForm.calories, 10) : null,
      };
      if (editItemId) await menuApi.updateItem(editItemId, payload);
      else await menuApi.addItem(payload);
      setItemDialog(false);
      setSnack({ open: true, message: editItemId ? 'Item updated' : 'Item added', severity: 'success' });
      fetchMenu();
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || 'Failed to save item', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await menuApi.deleteItem(id);
      setConfirmDelete(null);
      setSnack({ open: true, message: 'Item deleted', severity: 'success' });
      fetchMenu();
    } catch {
      setSnack({ open: true, message: 'Failed to delete item', severity: 'error' });
    }
  };

  const handleToggleItem = async (id) => {
    try {
      await menuApi.toggleAvailability(id);
      setSnack({ open: true, message: 'Item availability updated', severity: 'success' });
      fetchMenu();
    } catch {
      setSnack({ open: true, message: 'Failed to toggle item', severity: 'error' });
    }
  };

  const availableCount = items.filter((item) => item.isAvailable).length;

  if (!restaurantId) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f7f8fb', py: { xs: 3, md: 5 } }}>
        <Container maxWidth="md">
          <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, border: '1px solid #fed7aa', bgcolor: '#fff7ed' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
              <Box sx={{ width: 52, height: 52, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: '#ffedd5', color: '#ea580c' }}>
                <WarningAmberIcon />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={950}>Select a restaurant first</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Menu management is tied to one restaurant. Open My Restaurants and choose Manage Menu.
                </Typography>
              </Box>
              <Button variant="contained" color="error" startIcon={<StorefrontIcon />} onClick={() => navigate('/owner/restaurants')} sx={{ borderRadius: 999, fontWeight: 900 }}>
                My Restaurants
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f8fb', py: { xs: 3, md: 4 } }}>
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Chip icon={<RestaurantMenuIcon />} label="Menu management" sx={{ mb: 1, bgcolor: '#fff1f2', color: '#b91c1c', fontWeight: 900, borderRadius: 999 }} />
            <Typography variant="h4" fontWeight={950} color="#171827">Manage Menu</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              {restaurantName || 'Selected restaurant'}
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button variant="outlined" color="inherit" onClick={() => navigate('/owner/restaurants')} sx={{ borderRadius: 999, fontWeight: 900, width: { xs: '100%', sm: 'auto' } }}>
              Restaurants
            </Button>
            <Button variant="contained" color="error" startIcon={<AddIcon />} onClick={tab === 0 ? openAddCategory : openAddItem} sx={{ borderRadius: 999, fontWeight: 900, width: { xs: '100%', sm: 'auto' } }}>
              {tab === 0 ? 'Add Category' : 'Add Item'}
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            ['Categories', categories.length, <CategoryIcon />],
            ['Items', items.length, <MenuBookIcon />],
            ['Available', availableCount, <RestaurantMenuIcon />],
          ].map(([label, value, icon]) => (
            <Grid item xs={12} sm={4} key={label}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(20,24,35,0.08)' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={900}>{label}</Typography>
                    <Typography variant="h5" fontWeight={950}>{value}</Typography>
                  </Box>
                  <Box sx={{ color: '#d32f2f', display: 'grid', placeItems: 'center' }}>{icon}</Box>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2, border: '1px solid rgba(20,24,35,0.08)', boxShadow: '0 16px 42px rgba(24,28,42,0.06)' }}>
          <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto" textColor="error" indicatorColor="error" sx={{ mb: 2.5, minHeight: 44, maxWidth: '100%', '& .MuiTab-root': { minHeight: 44, fontWeight: 950 } }}>
            <Tab label={`Categories (${categories.length})`} />
            <Tab label={`Items (${items.length})`} />
          </Tabs>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress color="error" />
            </Box>
          ) : tab === 0 ? (
            categories.length === 0 ? (
              <EmptyState title="No categories yet" message="Create categories like Starters, Pizza, Desserts, or Beverages before adding items." action="Add Category" onAction={openAddCategory} />
            ) : (
              <Grid container spacing={2}>
                {categories.map((cat) => (
                  <Grid item xs={12} md={6} lg={4} key={cat.categoryId}>
                    <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid rgba(20,24,35,0.08)' }}>
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                          <Box>
                            <Typography variant="h6" fontWeight={950}>{cat.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{cat.description || 'No description'}</Typography>
                          </Box>
                          <Stack direction="row" spacing={0.5}>
                            <IconButton size="small" color="primary" onClick={() => openEditCategory(cat)}><EditIcon fontSize="small" /></IconButton>
                            <IconButton size="small" color="error" onClick={() => setConfirmDelete({ type: 'category', id: cat.categoryId, name: cat.name })}><DeleteIcon fontSize="small" /></IconButton>
                          </Stack>
                        </Stack>
                        <Chip label={`Display order ${cat.displayOrder}`} size="small" sx={{ mt: 2, borderRadius: 999, fontWeight: 800 }} />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )
          ) : items.length === 0 ? (
            <EmptyState title="No items yet" message="Add dishes with price, category, image, tags, and availability." action="Add Item" onAction={openAddItem} />
          ) : (
            <Grid container spacing={2}>
              {items.map((item) => (
                <Grid item xs={12} md={6} lg={4} key={item.itemId}>
                  <Card elevation={0} sx={{ height: '100%', borderRadius: 2, border: '1px solid rgba(20,24,35,0.08)', opacity: item.isAvailable ? 1 : 0.62 }}>
                    <CardContent>
                      <Stack spacing={1.5}>
                        <Stack direction="row" justifyContent="space-between" spacing={1}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle1" fontWeight={950} noWrap>{item.name}</Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>{item.description || 'No description'}</Typography>
                          </Box>
                          <Stack direction="row" spacing={0.5}>
                            <IconButton size="small" color="primary" onClick={() => openEditItem(item)}><EditIcon fontSize="small" /></IconButton>
                            <IconButton size="small" color="error" onClick={() => setConfirmDelete({ type: 'item', id: item.itemId, name: item.name })}><DeleteIcon fontSize="small" /></IconButton>
                          </Stack>
                        </Stack>

                        <Typography variant="h6" fontWeight={950}>Rs.{item.discountedPrice || item.price}</Typography>
                        <Stack direction="row" spacing={0.75} flexWrap="wrap">
                          <Chip label={item.isVeg ? 'Veg' : 'Non-veg'} size="small" color={item.isVeg ? 'success' : 'error'} variant="outlined" sx={{ borderRadius: 999, fontWeight: 900 }} />
                          <Chip label={item.isAvailable ? 'Available' : 'Unavailable'} size="small" color={item.isAvailable ? 'success' : 'default'} onClick={() => handleToggleItem(item.itemId)} sx={{ borderRadius: 999, fontWeight: 900, cursor: 'pointer' }} />
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>

        <Dialog open={catDialog} onClose={() => setCatDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
          <DialogTitle fontWeight={950}>{editCatId ? 'Edit Category' : 'Add Category'}</DialogTitle>
          <DialogContent>
            <TextField fullWidth label="Name" value={catForm.name} margin="dense" onChange={(event) => setCatForm({ ...catForm, name: event.target.value })} />
            <TextField fullWidth label="Description" value={catForm.description} margin="dense" onChange={(event) => setCatForm({ ...catForm, description: event.target.value })} />
            <TextField fullWidth label="Display Order" type="number" value={catForm.displayOrder} margin="dense" onChange={(event) => setCatForm({ ...catForm, displayOrder: parseInt(event.target.value, 10) || 0 })} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setCatDialog(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleSaveCategory} disabled={submitting} sx={{ borderRadius: 999, fontWeight: 900 }}>{submitting ? 'Saving...' : 'Save'}</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={itemDialog} onClose={() => setItemDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
          <DialogTitle fontWeight={950}>{editItemId ? 'Edit Item' : 'Add Item'}</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="dense" size="small">
              <InputLabel>Category</InputLabel>
              <Select value={itemForm.categoryId} label="Category" onChange={(event) => setItemForm({ ...itemForm, categoryId: event.target.value })}>
                {categories.map((cat) => <MenuItem key={cat.categoryId} value={cat.categoryId}>{cat.name}</MenuItem>)}
              </Select>
            </FormControl>

            {[
              { name: 'name', label: 'Item Name' },
              { name: 'description', label: 'Description' },
              { name: 'price', label: 'Price (Rs.)' },
              { name: 'discountedPrice', label: 'Discounted Price (optional)' },
              { name: 'calories', label: 'Calories' },
              { name: 'tags', label: 'Tags (comma separated)' },
              { name: 'imageUrl', label: 'Image URL (optional)' },
            ].map((field) => (
              <TextField key={field.name} fullWidth label={field.label} name={field.name} value={itemForm[field.name]} onChange={(event) => setItemForm({ ...itemForm, [field.name]: event.target.value })} margin="dense" size="small" />
            ))}

            {itemForm.imageUrl && (
              <Box sx={{ mt: 1, textAlign: 'center' }}>
                <img src={itemForm.imageUrl} alt="preview" style={{ maxHeight: 120, borderRadius: 8, objectFit: 'cover', maxWidth: '100%' }} onError={(event) => { event.target.style.display = 'none'; }} />
              </Box>
            )}

            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
              <FormControlLabel control={<Switch checked={itemForm.isVeg} color="success" onChange={(event) => setItemForm({ ...itemForm, isVeg: event.target.checked })} />} label="Veg" />
              <FormControlLabel control={<Switch checked={itemForm.isAvailable} color="success" onChange={(event) => setItemForm({ ...itemForm, isAvailable: event.target.checked })} />} label="Available" />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setItemDialog(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleSaveItem} disabled={submitting} sx={{ borderRadius: 999, fontWeight: 900 }}>{submitting ? 'Saving...' : 'Save'}</Button>
          </DialogActions>
        </Dialog>

        <ConfirmDialog
          open={Boolean(confirmDelete)}
          title={confirmDelete?.type === 'category' ? 'Delete Category?' : 'Delete Menu Item?'}
          message={confirmDelete?.type === 'category' ? `Delete "${confirmDelete?.name}" and all its items?` : `Delete "${confirmDelete?.name}" from the menu?`}
          confirmText="Delete"
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => (confirmDelete?.type === 'category' ? handleDeleteCategory(confirmDelete.id) : handleDeleteItem(confirmDelete.id))}
        />

        <AppSnackbar open={snack.open} message={snack.message} severity={snack.severity} onClose={() => setSnack((current) => ({ ...current, open: false }))} />
      </Container>
    </Box>
  );
};

const EmptyState = ({ title, message, action, onAction }) => (
  <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: 2, border: '1px dashed rgba(211,47,47,0.35)' }}>
    <RestaurantMenuIcon sx={{ fontSize: 52, color: '#d32f2f', mb: 1 }} />
    <Typography variant="h6" fontWeight={950}>{title}</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>{message}</Typography>
    <Button variant="contained" color="error" startIcon={<AddIcon />} onClick={onAction} sx={{ borderRadius: 999, fontWeight: 900 }}>{action}</Button>
  </Paper>
);

export default ManageMenu;
