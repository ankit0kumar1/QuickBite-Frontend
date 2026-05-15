// src/api/adminApi.js
import axiosInstance from './axiosInstance';

const adminApi = {
  // Users
  getAllUsers: () =>
    axiosInstance.get('/auth/admin/users'),

  // We use existing APIs for the rest
};

export default adminApi;