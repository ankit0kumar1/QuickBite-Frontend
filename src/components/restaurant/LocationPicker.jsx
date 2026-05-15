// src/components/restaurant/LocationPicker.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Button, Typography, CircularProgress, Alert,
  TextField, InputAdornment,
} from '@mui/material';
import MyLocationIcon   from '@mui/icons-material/MyLocation';
import SearchIcon       from '@mui/icons-material/Search';
import PlaceIcon        from '@mui/icons-material/Place';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── Fix Leaflet default marker icon (broken in bundlers) ──────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ── Custom red marker for restaurant ──────────────────────────────
const redIcon = new L.Icon({
  iconUrl:       'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize:      [25, 41],
  iconAnchor:    [12, 41],
  popupAnchor:   [1, -34],
  shadowSize:    [41, 41],
});

// ── Sub-component: click handler on map ───────────────────────────
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ── Sub-component: fly map to new position ────────────────────────
function FlyToPosition({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 16, { duration: 1.2 });
    }
  }, [position, map]);
  return null;
}

// ── Main Component ────────────────────────────────────────────────
const LocationPicker = ({ latitude, longitude, onLocationChange, address, city, label }) => {
  const [loading, setLoading]     = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError]         = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState(
    latitude && longitude
      ? [latitude, longitude]
      : [23.2599, 77.4126] // Default: Bhopal
  );
  const [markerPos, setMarkerPos] = useState(
    latitude && longitude
      ? [latitude, longitude]
      : null
  );

  // Update marker when parent passes new lat/lng
  useEffect(() => {
    if (latitude && longitude) {
      setMarkerPos([latitude, longitude]);
      setMapCenter([latitude, longitude]);
    }
  }, [latitude, longitude]);

  // ── 1. GPS: Use My Location ─────────────────────────────────────
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setMarkerPos([lat, lng]);
        setMapCenter([lat, lng]);
        onLocationChange(lat, lng);
        setLoading(false);
      },
      (err) => {
        setError(
          err.code === 1
            ? 'Location permission denied. Please allow location access.'
            : 'Unable to retrieve your location. Try searching instead.'
        );
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ── 2. Geocode: Search address ──────────────────────────────────
  const handleSearch = async (query) => {
    const searchText = query || searchQuery || `${address || ''} ${city || ''}`.trim();
    if (!searchText) {
      setError('Enter an address or city to search');
      return;
    }

    setSearching(true);
    setError('');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=1`,
        {
          headers: { 'Accept-Language': 'en' },
        }
      );
      const data = await response.json();

      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setMarkerPos([lat, lng]);
        setMapCenter([lat, lng]);
        onLocationChange(lat, lng);
      } else {
        setError('Location not found. Try a more specific address.');
      }
    } catch {
      setError('Search failed. Check your internet connection.');
    } finally {
      setSearching(false);
    }
  };

  // ── 3. Map click: manual selection ──────────────────────────────
  const handleMapClick = (lat, lng) => {
    setMarkerPos([lat, lng]);
    onLocationChange(lat, lng);
    setError('');
  };

  // ── Auto-geocode when address + city changes ────────────────────
  const geocodeTimeoutRef = useRef(null);
  useEffect(() => {
    if (address && city && !markerPos) {
      clearTimeout(geocodeTimeoutRef.current);
      geocodeTimeoutRef.current = setTimeout(() => {
        handleSearch(`${address}, ${city}`);
      }, 1500); // debounce 1.5s
    }
    return () => clearTimeout(geocodeTimeoutRef.current);
  }, [address, city]);

  return (
    <Box sx={{
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      p: 2,
      mt: 1,
      mb: 1,
      backgroundColor: '#fafafa',
    }}>
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <PlaceIcon fontSize="small" color="error" />
        {label || 'Restaurant Location'}
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 1.5, py: 0 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Action buttons row */}
      <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={loading ? <CircularProgress size={16} /> : <MyLocationIcon />}
          onClick={handleUseMyLocation}
          disabled={loading}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            borderColor: '#d32f2f',
            color: '#d32f2f',
            '&:hover': { borderColor: '#b71c1c', backgroundColor: '#fff5f5' },
          }}
        >
          {loading ? 'Detecting...' : 'Use My Location'}
        </Button>
      </Box>

      {/* Search bar */}
      <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search address (e.g. MG Road, Bhopal)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#fff' } }}
        />
        <Button
          variant="contained"
          size="small"
          onClick={() => handleSearch()}
          disabled={searching}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            backgroundColor: '#d32f2f',
            minWidth: 80,
            '&:hover': { backgroundColor: '#b71c1c' },
          }}
        >
          {searching ? <CircularProgress size={18} color="inherit" /> : 'Search'}
        </Button>
      </Box>

      {/* Map */}
      <Box sx={{
        height: 250,
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid #e0e0e0',
        mb: 1,
        '& .leaflet-container': { height: '100%', width: '100%', borderRadius: 8 },
      }}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleMapClick} />
          <FlyToPosition position={markerPos} />
          {markerPos && (
            <Marker position={markerPos} icon={redIcon} />
          )}
        </MapContainer>
      </Box>

      {/* Coordinates display */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        px: 1,
      }}>
        {markerPos ? (
          <Typography variant="caption" color="text.secondary">
            📍 Lat: <strong>{markerPos[0].toFixed(6)}</strong> &nbsp;|&nbsp;
            Lng: <strong>{markerPos[1].toFixed(6)}</strong>
          </Typography>
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Click on the map, search, or use GPS to set location
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default LocationPicker;
