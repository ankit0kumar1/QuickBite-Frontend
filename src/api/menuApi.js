// src/api/menuApi.js
import axiosInstance from './axiosInstance';

const MENU_URL = '/menu';

const menuApi = {

  // Categories
  getCategoriesByRestaurant: (restaurantId) =>
    axiosInstance.get(
      `${MENU_URL}/categories/restaurant/${restaurantId}`
    ),

  addCategory: (data) =>
    axiosInstance.post(`${MENU_URL}/categories`, data),

  updateCategory: (id, data) =>
    axiosInstance.put(`${MENU_URL}/categories/${id}`, data),

  deleteCategory: (id) =>
    axiosInstance.delete(`${MENU_URL}/categories/${id}`),

  // Items
  getItemsByRestaurant: (restaurantId) =>
    axiosInstance.get(
      `${MENU_URL}/items/restaurant/${restaurantId}`
    ),

  getItemsByCategory: (categoryId) =>
    axiosInstance.get(
      `${MENU_URL}/items/category/${categoryId}`
    ),

  getItemById: (id) =>
    axiosInstance.get(`${MENU_URL}/items/${id}`),

  addItem: (data) =>
    axiosInstance.post(`${MENU_URL}/items`, data),

  updateItem: (id, data) =>
    axiosInstance.put(`${MENU_URL}/items/${id}`, data),

  toggleAvailability: (id) =>
    axiosInstance.put(`${MENU_URL}/items/${id}/toggle`),

  deleteItem: (id) =>
    axiosInstance.delete(`${MENU_URL}/items/${id}`),

  getVegItems: (restaurantId) =>
    axiosInstance.get(
      `${MENU_URL}/items/restaurant/${restaurantId}/veg`
    ),

  searchItems: (name) =>
    axiosInstance.get(
      `${MENU_URL}/items/search?name=${name}`
    ),

  getAvailableItems: (restaurantId) =>
    axiosInstance.get(
      `${MENU_URL}/items/restaurant/${restaurantId}/available`
    ),
};

export default menuApi;