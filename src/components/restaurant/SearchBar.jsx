// src/components/restaurant/SearchBar.jsx
import React, { useState } from 'react';
import {
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';

const CUISINES = [
  'All', 'Indian', 'Chinese', 'Italian',
  'Mexican', 'Pizza', 'Burgers', 'Biryani',
];

const SearchBar = ({ onSearch, onCuisineFilter }) => {
  const [query, setQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');

  const handleSearch = () => {
    onSearch(query.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  const handleCuisine = (cuisine) => {
    setSelectedCuisine(cuisine);
    onCuisineFilter(cuisine === 'All' ? '' : cuisine);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        mb: 3,
        borderRadius: 4,
        border: '1px solid rgba(20,24,35,0.08)',
        boxShadow: '0 12px 36px rgba(24, 28, 42, 0.06)',
        background: 'rgba(255,255,255,0.92)',
      }}
    >
      <TextField
        fullWidth
        placeholder="Search restaurants by name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: query && (
            <InputAdornment position="end">
              <IconButton onClick={handleClear} size="small" aria-label="clear search">
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: 3,
            minHeight: 58,
            backgroundColor: '#fff',
          },
        }}
      />

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        {CUISINES.map((cuisine) => {
          const selected = selectedCuisine === cuisine;
          return (
            <Chip
              key={cuisine}
              label={cuisine}
              onClick={() => handleCuisine(cuisine)}
              color={selected ? 'error' : 'default'}
              variant={selected ? 'filled' : 'outlined'}
              sx={{
                borderRadius: 999,
                px: 0.75,
                height: 38,
                fontWeight: 800,
                bgcolor: selected ? undefined : '#fff',
              }}
            />
          );
        })}
      </Stack>
    </Paper>
  );
};

export default SearchBar;
