// src/services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000",
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

export const getLatlng = (digipin) =>
  API.get("/api/latlng", { params: { digipin } });

export const getQrCode = (digipin, imgFormat = "png", fmt = "json") =>
  API.get("/api/qr", {
    params: {
      digipin,
      img_format: imgFormat,
      format: fmt,
    },
    responseType: imgFormat === "svg" ? "text" : "blob",
  });

export const getQrCodeDownload = (digipin, imgFormat = "png", fmt = "json") =>
  API.get("/api/qr/download", {
    params: {
      digipin,
      img_format: imgFormat,
      format: fmt,
    },
    responseType: imgFormat === "svg" ? "text" : "blob",
  });

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

export const downloadProofOfLocation = (digipin) =>
  API.post(
    "/api/proof-of-location",
    { digipin },
    { responseType: "blob" } // PDF is binary
  );

export const listAllUsers = () => API.get("/admin/users");
export const saveEvent = (eventData) => API.post("/api/events", eventData);

