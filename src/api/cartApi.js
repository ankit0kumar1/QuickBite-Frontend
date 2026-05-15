// src/api/cartApi.js
import axiosInstance from './axiosInstance';

const CART_URL = '/cart';

const cartApi = {

  getCart: () =>
    axiosInstance.get(CART_URL),

  addItem: (data) =>
    axiosInstance.post(`${CART_URL}/items`, data),

  updateQuantity: (data) =>
    axiosInstance.put(`${CART_URL}/items`, data),

  removeItem: (menuItemId) =>
    axiosInstance.delete(`${CART_URL}/items/${menuItemId}`),

  applyPromo: (code) =>
    axiosInstance.post(`${CART_URL}/promo?code=${code}`),

  clearCart: () =>
    axiosInstance.delete(CART_URL),

  switchRestaurant: (data) =>
    axiosInstance.post(`${CART_URL}/switch`, data),
};

export default cartApi;