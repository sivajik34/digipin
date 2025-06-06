// src/services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000", // your FastAPI backend
});

export const fetchDigipin = (lat, lng) =>
  API.get("/api/digipin", { params: { lat, lng } });

