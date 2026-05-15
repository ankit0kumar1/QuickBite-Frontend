// src/api/deliveryApi.js
import axiosInstance from './axiosInstance';

const DELIVERY_URL = '/delivery';

const deliveryApi = {

  // Agent
  registerAgent: (data) =>
    axiosInstance.post(
      `${DELIVERY_URL}/agents/register`, data),

  getMyProfile: () =>
    axiosInstance.get(`${DELIVERY_URL}/agents/me`),

  updateStatus: (status) =>
    axiosInstance.put(
      `${DELIVERY_URL}/agents/status?status=${status}`),

  updateLocation: (data) =>
    axiosInstance.put(
      `${DELIVERY_URL}/agents/location`, data),

  // Assignments
  getAvailableOrders: () =>
    axiosInstance.get(`${DELIVERY_URL}/assignments/available`),

  claimOrder: (orderId) =>
    axiosInstance.post(
      `${DELIVERY_URL}/assignments/claim/${orderId}`),

  getMyAssignments: () =>
    axiosInstance.get(`${DELIVERY_URL}/assignments/my`),

  markPickedUp: (id) =>
    axiosInstance.put(
      `${DELIVERY_URL}/assignments/${id}/pickup`),

  markDelivered: (id) =>
    axiosInstance.put(
      `${DELIVERY_URL}/assignments/${id}/deliver`),

  // Live tracking
  trackOrder: (orderId) =>
    axiosInstance.get(`${DELIVERY_URL}/track/${orderId}`),

  // Admin: verify agent
  verifyAgent: (agentId) =>
    axiosInstance.put(`${DELIVERY_URL}/agents/${agentId}/verify`),

  rejectAgent: async (agentId) => {
    try {
      return await axiosInstance.put(`${DELIVERY_URL}/agents/${agentId}/reject`);
    } catch (err) {
      if (err.response?.status !== 404) throw err;
    }

    try {
      return await axiosInstance.put(`${DELIVERY_URL}/agents/${agentId}/deactivate`);
    } catch (err) {
      if (err.response?.status !== 404) throw err;
    }

    return axiosInstance.delete(`${DELIVERY_URL}/agents/${agentId}`);
  },

  // Get all agents (admin)
  getAllAgents: () =>
    axiosInstance.get(`${DELIVERY_URL}/agents`),

  // Agent earnings
  getMyEarnings: () =>
    axiosInstance.get(`${DELIVERY_URL}/agents/me/earnings`),
};

export default deliveryApi;
