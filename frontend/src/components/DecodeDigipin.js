import React, { useState } from "react";
import { decodeDigipin } from "../services/api";

const DecodeDigipin = () => {
  const [digipin, setDigipin] = useState("");
  const [latlng, setLatlng] = useState(null);
  const [error, setError] = useState("");

  // Allowed characters for digipin (excluding dash here since we add it automatically)
  const ALLOWED_CHARS_REGEX = /^[FCJKLMPT2-9]*$/i;

  // Function to add dashes automatically in format 3-3-4
  const formatDigipin = (value) => {
    // Remove all non-allowed chars including dashes first
    const cleaned = value.replace(/[^FCJKLMPT2-9]/gi, "").toUpperCase();

    // Split cleaned string into parts of 3,3,4
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

    // Validate only allowed chars (excluding dashes because formatting handles that)
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

    // Remove dashes before sending
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
          placeholder="Enter DIGIPIN (e.g. CCC-L94-44LC)"
          maxLength={13} // 10 chars + 2 dashes + 1 extra space buffer
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
