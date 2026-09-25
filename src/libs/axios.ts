import axios from "axios";
import { useAuthStore } from "@/src/store/authStore";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000/api";

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Untuk ngirim cookie (refresh token, dsb) kalau backend set cookie
});

// Interceptor untuk menyisipkan token ke setiap request (kalau token disimpan di Zustand/localStorage)
axiosInstance.interceptors.request.use(
  (config) => {
    // Ambil token langsung dari state
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor response buat nge-handle kalau token expired (401)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Auto logout kalau token gak valid
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
