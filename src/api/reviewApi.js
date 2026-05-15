// src/api/reviewApi.js
import axiosInstance from './axiosInstance';

const REVIEW_URL = '/reviews';

const reviewApi = {

  addReview: (data) =>
    axiosInstance.post(REVIEW_URL, data),

  getByRestaurant: (restaurantId) =>
    axiosInstance.get(
      `${REVIEW_URL}/restaurant/${restaurantId}`
    ),

  getMyReviews: () =>
    axiosInstance.get(`${REVIEW_URL}/my`),

  getByOrder: (orderId) =>
    axiosInstance.get(`${REVIEW_URL}/order/${orderId}`),

  getByAgent: (agentId) =>
    axiosInstance.get(`${REVIEW_URL}/agent/${agentId}`),

  updateReview: (id, data) =>
    axiosInstance.put(`${REVIEW_URL}/${id}`, data),

  deleteReview: (id) =>
    axiosInstance.delete(`${REVIEW_URL}/${id}`),

  getAvgFoodRating: (restaurantId) =>
    axiosInstance.get(
      `${REVIEW_URL}/avg/restaurant/${restaurantId}`
    ),

  getAvgDeliveryRating: (agentId) =>
    axiosInstance.get(
      `${REVIEW_URL}/avg/agent/${agentId}`
    ),

  getAllReviews: () =>
    axiosInstance.get(`${REVIEW_URL}/all`),

  verifyReview: (id) =>
    axiosInstance.put(`${REVIEW_URL}/${id}/verify`),
};

export default reviewApi;