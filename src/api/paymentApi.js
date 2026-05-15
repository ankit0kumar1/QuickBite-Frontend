// src/api/paymentApi.js
import axiosInstance from './axiosInstance';

const PAYMENT_URL = '/payments';

const paymentApi = {

  // Initiate payment (RAZORPAY or COD)
  initiate: (data) =>
    axiosInstance.post(`${PAYMENT_URL}/initiate`, data),

  // Verify Razorpay payment after checkout
  verify: (data) =>
    axiosInstance.post(`${PAYMENT_URL}/verify`, data),

  // Pay from wallet
  payFromWallet: (data) =>
    axiosInstance.post(`${PAYMENT_URL}/wallet/pay`, data),

  // Get wallet balance
  getWalletBalance: () =>
    axiosInstance.get(`${PAYMENT_URL}/wallet/balance`),

  // Get wallet statements
  getWalletStatements: () =>
    axiosInstance.get(`${PAYMENT_URL}/wallet/statements`),

  // Initiate wallet topup
  initiateTopUp: (data) =>
    axiosInstance.post(
      `${PAYMENT_URL}/wallet/topup/initiate`, data),

  // Verify wallet topup
  verifyTopUp: (data) =>
    axiosInstance.post(
      `${PAYMENT_URL}/wallet/topup/verify`, data),

  // Get payment by order
  getByOrder: (orderId) =>
    axiosInstance.get(`${PAYMENT_URL}/order/${orderId}`),

  // Get my payments
  getMyPayments: () =>
    axiosInstance.get(`${PAYMENT_URL}/my`),
};

export default paymentApi;