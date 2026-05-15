import axiosInstance from './axiosInstance';

const authApi = {
  forgotPassword: (email) =>
    axiosInstance.post('/auth/forgot-password', { email }, {
      skipAuth: true,
      skipAuthRedirect: true,
    }),

  resetPassword: (token, newPassword) =>
    axiosInstance.post('/auth/reset-password', { token, newPassword }, {
      skipAuth: true,
      skipAuthRedirect: true,
    }),
};

export default authApi;
