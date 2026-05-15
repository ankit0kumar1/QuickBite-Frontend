// src/api/orderApi.js
import axiosInstance from './axiosInstance';

const ORDER_URL = '/orders';

const orderApi = {

  placeOrder: (data) =>
    axiosInstance.post(ORDER_URL, data),

  getOrderById: (id) =>
    axiosInstance.get(`${ORDER_URL}/${id}`),

  getAllOrders: () =>
    axiosInstance.get(`${ORDER_URL}/admin/all`),

  getMyOrders: () =>
    axiosInstance.get(`${ORDER_URL}/my`),

  getActiveOrders: () =>
    axiosInstance.get(`${ORDER_URL}/my/active`),

  getOrdersByRestaurant: (restaurantId) =>
    axiosInstance.get(
      `${ORDER_URL}/restaurant/${restaurantId}`
    ),

  updateStatus: (id, status) =>
    axiosInstance.put(
      `${ORDER_URL}/${id}/status?status=${status}`
    ),

  cancelOrder: (id) =>
    axiosInstance.put(`${ORDER_URL}/${id}/cancel`),

  reorder: (id) =>
    axiosInstance.post(`${ORDER_URL}/${id}/reorder`),

  getOrderCount: (restaurantId) =>
    axiosInstance.get(
      `${ORDER_URL}/count/${restaurantId}`
    ),
};

export default orderApi;
