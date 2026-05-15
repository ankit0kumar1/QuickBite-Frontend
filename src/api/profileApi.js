// src/api/profileApi.js
import axiosInstance from './axiosInstance';

const profileApi = {
  getProfile: () =>
    axiosInstance.get('/auth/profile'),

  updateProfile: (data) =>
    axiosInstance.put('/auth/profile', data),

  changePassword: (data) =>
    axiosInstance.put('/auth/password', data),

  // OAuth2 — exchange OAuth token from provider for a QuickBite JWT
  oauthCallback: (data) =>
    axiosInstance.post('/auth/oauth2/callback', data),
};

export default profileApi;
