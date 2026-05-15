import React from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';

const isValidPoint = (lat, lng) =>
  typeof lat === 'number' &&
  typeof lng === 'number' &&
  Number.isFinite(lat) &&
  Number.isFinite(lng);

const getRouteKey = (points) =>
  points.map(([lat, lng]) => `${lat.toFixed(6)},${lng.toFixed(6)}`).join('|');

const parseRouteKey = (routeKey) =>
  routeKey
    ? routeKey.split('|').map((point) => point.split(',').map(Number))
    : [];

const buildOsrmUrl = ([start, end]) => {
  const coordinates = [start, end]
    .map(([lat, lng]) => `${lng},${lat}`)
    .join(';');

  return `${OSRM_BASE_URL}/${coordinates}?overview=full&geometries=geojson`;
};

const parseOsrmGeometry = (data) => {
  const coordinates = data?.routes?.[0]?.geometry?.coordinates;

  if (!Array.isArray(coordinates)) {
    return [];
  }

  return coordinates
    .map(([lng, lat]) => [lat, lng])
    .filter(([lat, lng]) => isValidPoint(lat, lng));
};

const useOsrmRoute = (points) => {
  const routeKey = React.useMemo(
    () => (points.length === 2 ? getRouteKey(points) : ''),
    [points]
  );
  const routePoints = React.useMemo(
    () => parseRouteKey(routeKey),
    [routeKey]
  );
  const fallback = React.useMemo(
    () => (routePoints.length === 2 ? routePoints : []),
    [routePoints]
  );
  const [route, setRoute] = React.useState(fallback);

  React.useEffect(() => {
    if (routePoints.length !== 2) {
      setRoute([]);
      return undefined;
    }

    const controller = new AbortController();
    setRoute(fallback);

    const loadRoute = async () => {
      try {
        const response = await fetch(buildOsrmUrl(routePoints), {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('OSRM route request failed');
        }

        const data = await response.json();
        const roadRoute = parseOsrmGeometry(data);

        if (!controller.signal.aborted) {
          setRoute(roadRoute.length > 1 ? roadRoute : fallback);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setRoute(fallback);
        }
      }
    };

    loadRoute();

    return () => {
      controller.abort();
    };
  }, [fallback, routePoints]);

  return route;
};

const FitRoute = ({ points }) => {
  const map = useMap();

  React.useEffect(() => {
    if (points.length === 0) {
      return;
    }

    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [32, 32] });
  }, [map, points]);

  return null;
};

const DeliveryLiveMap = ({ tracking, height = 320 }) => {
  const restaurantPoint = isValidPoint(
    tracking?.restaurantLatitude,
    tracking?.restaurantLongitude
  )
    ? [tracking.restaurantLatitude, tracking.restaurantLongitude]
    : null;

  const customerPoint = isValidPoint(
    tracking?.deliveryLatitude,
    tracking?.deliveryLongitude
  )
    ? [tracking.deliveryLatitude, tracking.deliveryLongitude]
    : null;

  const agentPoint = isValidPoint(
    tracking?.agentLatitude,
    tracking?.agentLongitude
  )
    ? [tracking.agentLatitude, tracking.agentLongitude]
    : null;

  const restaurantToCustomer =
    restaurantPoint && customerPoint
      ? [restaurantPoint, customerPoint]
      : [];

  let agentTargetLine = [];
  if (agentPoint && tracking?.status === 'ASSIGNED' && restaurantPoint) {
    agentTargetLine = [agentPoint, restaurantPoint];
  } else if (agentPoint && tracking?.status === 'PICKED_UP' && customerPoint) {
    agentTargetLine = [agentPoint, customerPoint];
  }

  const routeLine = useOsrmRoute(restaurantToCustomer);
  const agentLine = useOsrmRoute(agentTargetLine);
  const fitPoints = [
    restaurantPoint,
    customerPoint,
    agentPoint,
    ...routeLine,
    ...agentLine,
  ].filter(Boolean);

  if (fitPoints.length === 0) {
    return (
      <Box
        sx={{
          height,
          borderRadius: 2,
          bgcolor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Route map will appear once the order and agent locations are available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap' }}>
        <Chip size="small" label="Restaurant" sx={{ bgcolor: '#ffe8cc' }} />
        <Chip size="small" label="Customer" sx={{ bgcolor: '#d6f5e8' }} />
        <Chip size="small" label="Agent" sx={{ bgcolor: '#dbeafe' }} />
      </Stack>

      <Box sx={{ height, borderRadius: 2, overflow: 'hidden' }}>
        <MapContainer
          center={fitPoints[0]}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitRoute points={fitPoints} />

          {routeLine.length >= 2 && (
            <Polyline
              positions={routeLine}
              pathOptions={{ color: '#22c55e', weight: 5, opacity: 0.7 }}
            />
          )}

          {agentLine.length >= 2 && (
            <Polyline
              positions={agentLine}
              pathOptions={{ color: '#2563eb', weight: 4, dashArray: '8 8' }}
            />
          )}

          {restaurantPoint && (
            <CircleMarker center={restaurantPoint} radius={10} pathOptions={{ color: '#f97316', fillColor: '#fb923c', fillOpacity: 0.9 }}>
              <Popup>{tracking?.restaurantName || 'Restaurant pickup point'}</Popup>
            </CircleMarker>
          )}

          {customerPoint && (
            <CircleMarker center={customerPoint} radius={10} pathOptions={{ color: '#15803d', fillColor: '#22c55e', fillOpacity: 0.9 }}>
              <Popup>{tracking?.deliveryAddress || 'Customer destination'}</Popup>
            </CircleMarker>
          )}

          {agentPoint && (
            <CircleMarker center={agentPoint} radius={11} pathOptions={{ color: '#1d4ed8', fillColor: '#3b82f6', fillOpacity: 0.95 }}>
              <Popup>{tracking?.agentName || 'Delivery agent'}</Popup>
            </CircleMarker>
          )}
        </MapContainer>
      </Box>
    </Box>
  );
};

export default DeliveryLiveMap;
