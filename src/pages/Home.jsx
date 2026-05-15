// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import SearchBar from '../components/restaurant/SearchBar';
import restaurantApi from '../api/restaurantApi';
import { useAuth } from '../context/AuthContext';

const ratingValue = (restaurant) => Number(restaurant?.avgRating || 0);

const sortByRating = (items = []) =>
  [...items].sort((a, b) => {
    const ratingDifference = ratingValue(b) - ratingValue(a);
    if (ratingDifference !== 0) return ratingDifference;
    return String(a?.name || '').localeCompare(String(b?.name || ''));
  });

const Home = () => {
  const { user } = useAuth();

  const [restaurants, setRestaurants] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await restaurantApi.getAll();
      const sortedRestaurants = sortByRating(res.data);
      setRestaurants(sortedRestaurants);
      setFiltered(sortedRestaurants);
    } catch (err) {
      setError('Failed to load restaurants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query) {
      setFiltered(
        activeTab === 1
          ? sortByRating(restaurants.filter((restaurant) => restaurant.isOpen))
          : sortByRating(restaurants)
      );
      return;
    }

    try {
      const res = await restaurantApi.search(query);
      const result = activeTab === 1
        ? res.data.filter((restaurant) => restaurant.isOpen)
        : res.data;
      setFiltered(sortByRating(result));
    } catch {
      const result = restaurants.filter((restaurant) =>
        restaurant.name.toLowerCase().includes(query.toLowerCase())
      );
      setFiltered(sortByRating(activeTab === 1 ? result.filter((r) => r.isOpen) : result));
    }
  };

  const handleCuisineFilter = async (cuisine) => {
    if (!cuisine) {
      setFiltered(
        activeTab === 1
          ? sortByRating(restaurants.filter((restaurant) => restaurant.isOpen))
          : sortByRating(restaurants)
      );
      return;
    }

    try {
      const res = await restaurantApi.getByCuisine(cuisine);
      const result = activeTab === 1
        ? res.data.filter((restaurant) => restaurant.isOpen)
        : res.data;
      setFiltered(sortByRating(result));
    } catch {
      const result = restaurants.filter((restaurant) =>
        restaurant.cuisine.toLowerCase() === cuisine.toLowerCase()
      );
      setFiltered(sortByRating(activeTab === 1 ? result.filter((r) => r.isOpen) : result));
    }
  };

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
    if (newValue === 1) {
      setFiltered(sortByRating(restaurants.filter((restaurant) => restaurant.isOpen)));
    } else {
      setFiltered(sortByRating(restaurants));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, rgba(255,247,242,0.86) 0%, #f7f8fb 320px, #f7f8fb 100%)',
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 4 },
            mb: 3,
            borderRadius: 4,
            border: '1px solid rgba(229,57,53,0.1)',
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(255,248,242,0.94) 100%)',
            boxShadow: '0 18px 60px rgba(24, 28, 42, 0.08)',
          }}
        >
          <Typography
            variant="h3"
            fontWeight={900}
            gutterBottom
            sx={{ fontSize: { xs: '2rem', md: '2.75rem' } }}
          >
            {user ? `Hey ${user.fullName?.split(' ')[0]}!` : 'Welcome to QuickBite'}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
            Discover top-rated restaurants near you.
          </Typography>
        </Paper>

        <SearchBar
          onSearch={handleSearch}
          onCuisineFilter={handleCuisineFilter}
        />

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="error"
          indicatorColor="error"
          sx={{
            mb: 3,
            '& .MuiTabs-flexContainer': { gap: 1 },
            '& .MuiTab-root': {
              minHeight: 44,
              px: 2.25,
            },
          }}
        >
          <Tab label="All Restaurants" />
          <Tab label="Open Now" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="error" />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No restaurants found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try a different search or cuisine filter
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 1.5,
                mb: 2,
              }}
            >
              <Typography variant="h6" fontWeight={800}>
                {filtered.length} restaurant{filtered.length !== 1 ? 's' : ''} found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sorted by highest rating
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {filtered.map((restaurant) => (
                <Grid item xs={12} sm={6} md={4} key={restaurant.restaurantId}>
                  <RestaurantCard restaurant={restaurant} />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
};

export default Home;
