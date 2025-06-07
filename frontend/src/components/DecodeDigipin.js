import React, { useState } from "react";
import { decodeDigipin,fetchDigipin } from "../services/api";
import LocationMap from "./LocationMap";

const DecodeDigipin = () => {
  const [digipin, setDigipin] = useState("");
  const [latlng, setLatlng] = useState(null);
  const [error, setError] = useState("");

  const ALLOWED_CHARS_REGEX = /^[FCJKLMPT2-9]*$/i;

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
    const rawInput = e.target.value;
    const formattedInput = formatDigipin(rawInput);
    const cleanedInput = formattedInput.replace(/-/g, "");
    if (ALLOWED_CHARS_REGEX.test(cleanedInput)) {
      setDigipin(formattedInput);
      setError("");
    } else {
      setError("Only F, C, J, K, L, M, P, T and digits 2–9 are allowed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLatlng(null);
    setError("");

    if (!digipin) {
      setError("DIGIPIN cannot be empty");
      return;
    }

    const formatted = digipin.replace(/-/g, "");
    if (formatted.length !== 10) {
      setError("DIGIPIN must be exactly 10 characters (excluding dashes)");
      return;
    }
    if (!ALLOWED_CHARS_REGEX.test(formatted)) {
      setError("Invalid DIGIPIN characters");
      return;
    }

    try {
      const res = await decodeDigipin(formatted);
      setLatlng({
        lat: parseFloat(res.data.latitude),
        lng: parseFloat(res.data.longitude),
      });
    } catch {
      setError("Failed to decode DIGIPIN");
    }
  };

  const handleMapClick = async (lat, lng) => {
  try {
    const res = await fetchDigipin(lat, lng);
    const digipinFromCoords = res.data.digipin;
    const formatted = formatDigipin(digipinFromCoords);
    setDigipin(formatted);
    setLatlng({ lat: lat, lng: lng });
    setError("");
  } catch (err) {
    setError("Failed to fetch DIGIPIN for selected location");
  }
};


  return (
    <div>
      <h3>Decode DIGIPIN</h3>
      <form onSubmit={handleSubmit}>
        <input
          value={digipin}
          onChange={handleChange}
          placeholder="Enter DIGIPIN (e.g. CCC-L94-44LC)"
          maxLength={13}
          required
        />
        <button type="submit">Get Coordinates</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {latlng &&  (
        <div>
          <p><strong>Latitude:</strong> {latlng.lat}</p>
          <p><strong>Longitude:</strong> {latlng.lng}</p>
          <LocationMap marker={
    latlng &&
    !isNaN(latlng.lat) &&
    !isNaN(latlng.lng)
      ? { lat: parseFloat(latlng.lat), lng: parseFloat(latlng.lng) }
      : null
  } onLocationSelect={handleMapClick} />
        </div>
      )}
    </div>
  );
};

export default DecodeDigipin;
