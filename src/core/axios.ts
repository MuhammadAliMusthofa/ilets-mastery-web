import axios from 'axios';
const isServer = typeof window === 'undefined';

const getBaseUrl = () => {
  if (isServer) {
    return process.env.NEXT_PUBLIC_ENV_BACKEND_URL || 'http://localhost:5001/api';
  }
  return '/api';
};

export const axiosWithBearer = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosWithBearer.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401 || status === 403) {
        if (!isServer) {
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);