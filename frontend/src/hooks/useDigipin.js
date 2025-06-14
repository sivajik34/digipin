import { useCallback } from "react";
import { encodeDigipinOffline, decodeDigipinOffline } from "../utils/digipin";
import { fetchDigipin, decodeDigipin } from "../services/api";
import { toast } from "react-toastify";

export const useDigipin = () => {
  const encodeDigipin = useCallback(async (lat, lng) => {
    if (!lat || !lng) {
      toast.error("Latitude and longitude are required.");
      return null;
    }

    if (!navigator.onLine) {
      const offline = encodeDigipinOffline(lat, lng);
      return {
        digipin: offline,
        source: "offline",
      };
    }

    try {
      const res = await fetchDigipin(lat, lng);
      return {
        digipin: res.data?.digipin,
        source: "online",
      };
    } catch (err) {
      toast.warn("Falling back to offline DIGIPIN encoding.");
      const offline = encodeDigipinOffline(lat, lng);
      return {
        digipin: offline,
        source: "offline",
      };
    }
  }, []);

  const decodeDigipin = useCallback(async (digipin) => {
    const cleaned = digipin.replace(/-/g, "").toUpperCase();
    if (cleaned.length !== 10) {
      toast.error("DIGIPIN must be exactly 10 characters.");
      return null;
    }

    if (!navigator.onLine) {
      const { latitude, longitude } = decodeDigipinOffline(cleaned);
      return {
        lat: latitude,
        lng: longitude,
        source: "offline",
      };
    }

    try {
      const res = await decodeDigipin(cleaned);
      const { latitude, longitude } = res?.data || {};
      if (!latitude || !longitude) throw new Error("Invalid coordinates");

      return {
        lat: parseFloat(latitude),
        lng: parseFloat(longitude),
        source: "online",
      };
    } catch (err) {
      toast.warn("Falling back to offline DIGIPIN decoding.");
      const { latitude, longitude } = decodeDigipinOffline(cleaned);
      return {
        lat: latitude,
        lng: longitude,
        source: "offline",
      };
    }
  }, []);

  return { encodeDigipin, decodeDigipin };
};
