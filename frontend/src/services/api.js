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

export const registerUser = (email, password) =>
  API.post("/auth/register", {
    email,
    password,
  });

export const decodeDigipin = (digipin) =>
  API.get("/api/latlng", { params: { digipin } });

export const getQrCodeUrl = (digipin) =>
  `${process.env.REACT_APP_API_URL}/api/qr?digipin=${digipin}`;

export const getQrDownloadUrl = (digipin) =>
  `${process.env.REACT_APP_API_URL}/api/qr/download?digipin=${digipin}`;

export const saveUserDigipin = (digipin, user_friendly_name) =>
  API.post("/api/digipin/user/save", { digipin, user_friendly_name });

export const listUserDigipins = () =>
  API.get("/api/digipin/user/list");

export const deleteUserDigipin = (id) =>
  API.delete(`/api/digipin/user/delete/${id}`);

export const fetchAddressFromDigipin = (digipin) =>
  API.get("/api/address", { params: { digipin } });

export const googleLogin = (token) =>
  API.post("/auth/google", { token });

export const optimizeRoute = (request) =>
  API.post("/api/optimize-route", request);
