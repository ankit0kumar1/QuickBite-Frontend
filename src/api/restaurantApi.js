// src/api/restaurantApi.js
import axiosInstance from './axiosInstance';

const RESTAURANT_URL = '/restaurants';

const restaurantApi = {

  // Get all approved restaurants
  getAll: () =>
    axiosInstance.get(RESTAURANT_URL),

  // Get by ID
  getById: (id) =>
    axiosInstance.get(`${RESTAURANT_URL}/${id}`),

  // Search by name
  search: (name) =>
    axiosInstance.get(`${RESTAURANT_URL}/search?name=${name}`),

  // Get by city
  getByCity: (city) =>
    axiosInstance.get(`${RESTAURANT_URL}/city/${city}`),

  // Get by cuisine
  getByCuisine: (cuisine) =>
    axiosInstance.get(`${RESTAURANT_URL}/cuisine/${cuisine}`),

  // Get nearby
  getNearby: (lat, lng, radius = 5.0) =>
    axiosInstance.get(
      `${RESTAURANT_URL}/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
    ),

  // Register new restaurant (Owner)
  register: (data) =>
    axiosInstance.post(RESTAURANT_URL, data),

  // Update restaurant (Owner)
  update: (id, data) =>
    axiosInstance.put(`${RESTAURANT_URL}/${id}`, data),

  // Toggle open/close (Owner)
  toggleOpen: (id) =>
    axiosInstance.put(`${RESTAURANT_URL}/${id}/toggle`),

  // Approve (Admin)
  approve: (id) =>
    axiosInstance.put(`${RESTAURANT_URL}/${id}/approve`),

  // Get pending (Admin)
  getPending: () =>
    axiosInstance.get(`${RESTAURANT_URL}/pending`),

  // Get my restaurants (Owner)
  getMyRestaurants: () =>
    axiosInstance.get(`${RESTAURANT_URL}/my`),

  // Delete (Admin)
  delete: (id) =>
    axiosInstance.delete(`${RESTAURANT_URL}/${id}`),

  // Analytics (Owner)
  getAnalytics: (id) =>
    axiosInstance.get(`${RESTAURANT_URL}/${id}/analytics`),
};

export default restaurantApi;