// src/components/DecodeDigipin.js
import React, { useState } from "react";
import { decodeDigipin } from "../services/api";

const DecodeDigipin = () => {
  const [digipin, setDigipin] = useState("");
  const [latlng, setLatlng] = useState(null);
  const [error, setError] = useState("");

  const ALLOWED_CHARS_REGEX = /^[FCJKLMPT2-9]*$/i;

  const handleChange = (e) => {
    const input = e.target.value.toUpperCase();
    if (ALLOWED_CHARS_REGEX.test(input)) {
      setDigipin(input);
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

    try {
      const res = await decodeDigipin(digipin);
      setLatlng(res.data);
    } catch {
      setError("Failed to decode DIGIPIN");
    }
  };

  return (
    <div>
      <h3>Decode DIGIPIN</h3>
      <form onSubmit={handleSubmit}>
        <input
          value={digipin}
          onChange={handleChange}
          placeholder="Enter DIGIPIN"
          maxLength={10}
          required
        />
        <button type="submit">Get Coordinates</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {latlng && (
        <div>
          <p><strong>Latitude:</strong> {latlng.latitude}</p>
          <p><strong>Longitude:</strong> {latlng.longitude}</p>
        </div>
      )}
    </div>
  );
};

export default DecodeDigipin;
