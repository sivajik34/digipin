// src/services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Add JWT token automatically if it's stored
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchDigipin = (lat, lng) =>
  API.get("/api/digipin", { params: { lat, lng } });

export const loginUser = (email, password) =>
  API.post("/auth/jwt/login", new URLSearchParams({ username: email, password }));

export const getCurrentUser = () => API.get("/users/me");


