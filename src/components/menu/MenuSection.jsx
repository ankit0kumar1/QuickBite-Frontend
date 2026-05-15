// src/components/menu/MenuSection.jsx
import React, { useState } from 'react';
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuItemCard from './MenuItemCard';

const MenuSection = ({ category, items, restaurantId, onAddToCart }) => {
  const [expanded, setExpanded] = useState(true);

  const categoryItems = items.filter(
    (item) => item.categoryId === category.categoryId
  );

  if (categoryItems.length === 0) return null;

  return (
    <Box sx={{ mb: 3.5 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        onClick={() => setExpanded((current) => !current)}
        sx={{
          cursor: 'pointer',
          py: 1.25,
          borderBottom: '1px solid rgba(20,24,35,0.08)',
        }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography variant="h6" fontWeight={950} color="#24242b">
              {category.name}
            </Typography>
            <Chip
              size="small"
              label={`${categoryItems.length} item${categoryItems.length !== 1 ? 's' : ''}`}
              sx={{ height: 22, borderRadius: 999, fontWeight: 800, bgcolor: '#f3f4f6' }}
            />
          </Stack>
          {category.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
              {category.description}
            </Typography>
          )}
        </Box>

        <IconButton size="small" aria-label={expanded ? 'Collapse category' : 'Expand category'}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Stack>

      <Collapse in={expanded}>
        <Stack spacing={1.5} sx={{ pt: 2 }}>
          {categoryItems.map((item) => (
            <MenuItemCard
              key={item.itemId}
              item={item}
              restaurantId={restaurantId}
              onAddToCart={onAddToCart}
            />
          ))}
        </Stack>
      </Collapse>
    </Box>
  );
};

export default MenuSection;
