import React, { useState } from "react";
import { decodeDigipin, fetchDigipin } from "../services/api";
import LocationMap from "./LocationMap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ALLOWED_CHARS_REGEX = /^[FCJKLMPT2-9]*$/i;

const DecodeDigipin = () => {
  const [digipin, setDigipin] = useState("");
  const [latlng, setLatlng] = useState(null);
  const [loading, setLoading] = useState(false);

  const formatDigipin = (value) => {
    const cleaned = value.replace(/[^FCJKLMPT2-9]/gi, "").toUpperCase();
    const part1 = cleaned.substring(0, 3);
    const part2 = cleaned.substring(3, 6);
    const part3 = cleaned.substring(6, 10);

    let formatted = part1;
    if (part2) formatted += "-" + part2;
    if (part3) formatted += "-" + part3;

    return formatted;
  };

  const handleChange = (e) => {
    const rawInput = e.target.value.toUpperCase();
    const cleanedInput = rawInput.replace(/-/g, "");

    if (ALLOWED_CHARS_REGEX.test(cleanedInput)) {
      setDigipin(formatDigipin(cleanedInput));
      setLatlng(null);
      setLoading(false);
    } else {
      toast.error(
        "Invalid character detected. Allowed: F, C, J, K, L, M, P, T and digits 2–9"
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLatlng(null);

    const formatted = digipin.replace(/-/g, "");
    if (!formatted) {
      toast.error("DIGIPIN cannot be empty");
      return;
    }
    if (formatted.length !== 10) {
      toast.error("DIGIPIN must be exactly 10 characters (excluding dashes)");
      return;
    }
    if (!ALLOWED_CHARS_REGEX.test(formatted)) {
      toast.error("DIGIPIN contains invalid characters");
      return;
    }

    try {
      setLoading(true);
      const res = await decodeDigipin(formatted);
      const { latitude, longitude } = res?.data || {};
      if (
        latitude === undefined ||
        longitude === undefined ||
        isNaN(latitude) ||
        isNaN(longitude)
      ) {
        throw new Error("Invalid coordinates received");
      }
      setLatlng({ lat: parseFloat(latitude), lng: parseFloat(longitude) });
      toast.success("DIGIPIN decoded successfully!");
    } catch (error) {
      toast.error("Failed to decode DIGIPIN");
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = async (lat, lng) => {
    try {
      setLoading(true);
      const res = await fetchDigipin(lat, lng);
      const digipinFromCoords = res?.data?.digipin || "";
      if (!digipinFromCoords) throw new Error("No DIGIPIN found");
      setDigipin(formatDigipin(digipinFromCoords));
      setLatlng({ lat, lng });
      toast.success("Fetched DIGIPIN for selected location!");
    } catch {
      toast.error("Failed to fetch DIGIPIN for selected location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold mb-4">Decode DIGIPIN</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6 max-w-xl">
        <input
          value={digipin}
          onChange={handleChange}
          placeholder="Enter DIGIPIN (e.g. CCC-L94-44LC)"
          maxLength={13}
          required
          disabled={loading}
          aria-label="DIGIPIN input"
          className="border border-gray-300 rounded-md px-4 py-2 text-xl uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <button
          type="submit"
          disabled={loading}
          className={`bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed`}
        >
          {loading ? "Loading..." : "Get Coordinates"}
        </button>
      </form>

      <LocationMap
        marker={
          latlng && !isNaN(latlng.lat) && !isNaN(latlng.lng)
            ? { lat: latlng.lat, lng: latlng.lng }
            : null
        }
        onLocationSelect={handleMapClick}
      />

      {latlng && (
        <div className="mt-6 bg-gray-50 p-4 rounded-md border border-gray-200 shadow-inner max-w-xl">
          <p className="text-lg">
            <strong>Latitude:</strong> {latlng.lat}
          </p>
          <p className="text-lg">
            <strong>Longitude:</strong> {latlng.lng}
          </p>
        </div>
      )}
    </div>
  );
};

export default DecodeDigipin;
