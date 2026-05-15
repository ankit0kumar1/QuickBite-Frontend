// src/pages/RestaurantDetail.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Rating,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ClearIcon from '@mui/icons-material/Clear';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PhoneIcon from '@mui/icons-material/Phone';
import RateReviewIcon from '@mui/icons-material/RateReview';
import SearchIcon from '@mui/icons-material/Search';
import ScheduleIcon from '@mui/icons-material/Schedule';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import restaurantApi from '../api/restaurantApi';
import menuApi from '../api/menuApi';
import reviewApi from '../api/reviewApi';
import AppSnackbar from '../components/common/AppSnackbar';
import MenuSection from '../components/menu/MenuSection';
import ReviewCard from '../components/review/ReviewCard';
import { StarDisplay } from '../components/review/StarRating';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(true);
  const [error, setError] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [reviewsTab, setReviewsTab] = useState(0);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchRestaurant();
    fetchMenu();
    fetchReviews();
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      const res = await restaurantApi.getById(id);
      setRestaurant(res.data);
    } catch {
      setError('Restaurant not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenu = async () => {
    setMenuLoading(true);
    try {
      const [catRes, itemRes] = await Promise.all([
        menuApi.getCategoriesByRestaurant(id),
        menuApi.getItemsByRestaurant(id),
      ]);
      setCategories(catRes.data);
      setAllItems(itemRes.data);
      setFilteredItems(itemRes.data);
    } catch {
      setCategories([]);
      setAllItems([]);
      setFilteredItems([]);
    } finally {
      setMenuLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const [revRes, avgRes] = await Promise.all([
        reviewApi.getByRestaurant(id),
        reviewApi.getAvgFoodRating(id),
      ]);
      setReviews(revRes.data);
      setAvgRating(avgRes.data);
    } catch {
      setReviews([]);
    }
  };

  const applyFilters = (query, veg) => {
    let result = [...allItems];
    if (veg) result = result.filter((item) => item.isVeg);
    if (query.trim()) {
      const normalizedQuery = query.trim().toLowerCase();
      result = result.filter((item) => item.name.toLowerCase().includes(normalizedQuery));
    }
    setFilteredItems(result);
  };

  const handleVegToggle = (checked) => {
    setVegOnly(checked);
    applyFilters(searchQuery, checked);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    applyFilters(query, vegOnly);
  };

  const handleAddToCart = (item) => {
    setSnack({ open: true, message: `Added ${item.name} to cart`, severity: 'success' });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress color="error" />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const displayRating =
    avgRating?.averageRating != null && avgRating.averageRating > 0
      ? avgRating.averageRating
      : restaurant.avgRating || 0;
  const reviewCount = avgRating?.totalReviews ?? 0;
  const heroImage =
    restaurant.imageUrl ||
    `https://placehold.co/1400x520/d32f2f/ffffff?text=${encodeURIComponent(restaurant.name)}`;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f8fb', pb: 5 }}>
      <Box
        sx={{
          minHeight: { xs: 300, md: 360 },
          backgroundImage: `linear-gradient(90deg, rgba(17,24,39,0.78), rgba(17,24,39,0.26)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#fff',
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        <Container maxWidth="lg" sx={{ pb: { xs: 4, md: 5 }, pt: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              mb: 4,
              bgcolor: 'rgba(255,255,255,0.94)',
              color: '#24242b',
              borderRadius: 999,
              px: 2,
              fontWeight: 900,
              '&:hover': { bgcolor: '#fff' },
            }}
          >
            Back
          </Button>

          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
            <Box sx={{ maxWidth: 760 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 1 }}>
                <Chip
                  label={restaurant.isOpen ? 'Open now' : 'Closed'}
                  color={restaurant.isOpen ? 'success' : 'default'}
                  sx={{ borderRadius: 999, fontWeight: 900 }}
                />
                {restaurant.cuisine && (
                  <Chip label={restaurant.cuisine} sx={{ borderRadius: 999, bgcolor: 'rgba(255,255,255,0.16)', color: '#fff', fontWeight: 800 }} />
                )}
              </Stack>

              <Typography variant="h3" fontWeight={950} sx={{ lineHeight: 1.05 }}>
                {restaurant.name}
              </Typography>
              {restaurant.description && (
                <Typography variant="body1" sx={{ mt: 1.25, opacity: 0.9, maxWidth: 680 }}>
                  {restaurant.description}
                </Typography>
              )}
            </Box>

            <Paper
              elevation={0}
              sx={{
                alignSelf: { xs: 'flex-start', md: 'flex-end' },
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.94)',
                minWidth: 220,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <StarRoundedIcon sx={{ color: '#f59e0b' }} />
                <Box>
                  <Typography fontWeight={950} color="#24242b">
                    {displayRating > 0 ? displayRating.toFixed(1) : 'New'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {reviewCount} review{reviewCount !== 1 ? 's' : ''}
                  </Typography>
                </Box>
                <Rating value={displayRating} precision={0.5} readOnly size="small" sx={{ ml: 'auto' }} />
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            mt: -3,
            mb: 3,
            borderRadius: 2,
            border: '1px solid rgba(20,24,35,0.08)',
            boxShadow: '0 18px 56px rgba(24,28,42,0.12)',
            overflow: 'hidden',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            divider={<Divider orientation="vertical" flexItem />}
            sx={{ bgcolor: '#fff' }}
          >
            {[
              ['Delivery Time', `${restaurant.estimatedDeliveryMin || 30} mins`, <AccessTimeIcon />],
              ['Minimum Order', `Rs.${restaurant.minOrderAmount || 0}`, <LocalOfferIcon />],
              ['Address', restaurant.address || restaurant.city, <LocationOnIcon />],
              ['Phone', restaurant.phone || 'Not available', <PhoneIcon />],
              ['Hours', restaurant.openingHours || '9AM - 11PM', <ScheduleIcon />],
            ].map(([label, value, icon]) => (
              <Stack key={label} direction="row" spacing={1.25} alignItems="center" sx={{ flex: 1, minWidth: 0, p: 2 }}>
                <Box sx={{ color: '#d32f2f', display: 'grid', placeItems: 'center', '& svg': { fontSize: 24 } }}>
                  {icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={800}>
                    {label}
                  </Typography>
                  <Typography variant="body2" fontWeight={900} color="#24242b" noWrap>
                    {value}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            p: { xs: 2, md: 3 },
            border: '1px solid rgba(20,24,35,0.08)',
            boxShadow: '0 16px 48px rgba(24,28,42,0.07)',
            bgcolor: '#fff',
          }}
        >
          <Tabs
            value={reviewsTab}
            onChange={(_, value) => setReviewsTab(value)}
            textColor="error"
            indicatorColor="error"
            sx={{
              mb: 3,
              minHeight: 44,
              '& .MuiTab-root': { minHeight: 44, px: 2.5, fontWeight: 950 },
            }}
          >
            <Tab icon={<MenuBookIcon />} iconPosition="start" label="Menu" />
            <Tab icon={<RateReviewIcon />} iconPosition="start" label={`Reviews (${reviews.length})`} />
          </Tabs>

          {reviewsTab === 0 && (
            <>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }} sx={{ mb: 3 }}>
                <TextField
                  placeholder="Search dishes..."
                  size="small"
                  value={searchQuery}
                  onChange={(event) => handleSearch(event.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => handleSearch('')} aria-label="Clear search">
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': { borderRadius: 999, bgcolor: '#f9fafb' },
                  }}
                />

                <FormControlLabel
                  sx={{ m: 0, whiteSpace: 'nowrap' }}
                  control={<Switch checked={vegOnly} onChange={(event) => handleVegToggle(event.target.checked)} color="success" />}
                  label={
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#22c55e' }} />
                      <Typography variant="body2" fontWeight={900}>
                        Veg only
                      </Typography>
                    </Stack>
                  }
                />
              </Stack>

              {menuLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress color="error" size={30} />
                </Box>
              ) : categories.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" fontWeight={900}>Menu not available yet</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    This restaurant has not published menu items.
                  </Typography>
                </Box>
              ) : filteredItems.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" fontWeight={900}>No dishes found</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Try a different search or remove the veg filter.
                  </Typography>
                </Box>
              ) : (
                categories.map((category) => (
                  <MenuSection
                    key={category.categoryId}
                    category={category}
                    items={filteredItems}
                    restaurantId={Number(id)}
                    onAddToCart={handleAddToCart}
                  />
                ))
              )}
            </>
          )}

          {reviewsTab === 1 && (
            <Box>
              {avgRating && (
                <Paper elevation={0} sx={{ p: 2, mb: 2.5, borderRadius: 2, bgcolor: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="h3" fontWeight={950} color="#c2410c">
                      {avgRating.averageRating?.toFixed(1)}
                    </Typography>
                    <Box>
                      <StarDisplay value={avgRating.averageRating} size="large" />
                      <Typography variant="body2" color="text.secondary">
                        {avgRating.totalReviews} review{avgRating.totalReviews !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              )}

              {reviews.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" fontWeight={900}>No reviews yet</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Customer feedback will appear here after completed orders.
                  </Typography>
                </Box>
              ) : (
                reviews.map((review) => <ReviewCard key={review.reviewId} review={review} />)
              )}
            </Box>
          )}
        </Paper>

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

export default RestaurantDetail;
