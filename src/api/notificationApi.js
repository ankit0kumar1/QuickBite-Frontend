// src/api/notificationApi.js
import axiosInstance from './axiosInstance';

const NOTIF_URL = '/notifications';

const notificationApi = {

  getMyNotifications: () =>
    axiosInstance.get(`${NOTIF_URL}/my`),

  getUnreadCount: () =>
    axiosInstance.get(`${NOTIF_URL}/unread-count`),

  markAsRead: (id) =>
    axiosInstance.put(`${NOTIF_URL}/${id}/read`),

  markAllRead: () =>
    axiosInstance.put(`${NOTIF_URL}/read-all`),

  deleteNotification: (id) =>
    axiosInstance.delete(`${NOTIF_URL}/${id}`),
};

export default notificationApi;