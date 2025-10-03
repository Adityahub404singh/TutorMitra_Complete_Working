import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  // Yahan Content-Type manually nahi dena hai
});

// Request interceptor to attach JWT token header
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("tm_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle unauthorized errors globally
http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("tm_token");
      localStorage.removeItem("auth_role");
      window.location.href = "/login"; // redirect to login page on unauthorized
    }
    return Promise.reject(error);
  }
);

export default http;
