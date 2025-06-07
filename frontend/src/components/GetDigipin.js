// src/components/GetDigipin.js
import React, { useState } from "react";
import { fetchDigipin } from "../services/api";
import QrCodeViewer from "./QrCodeViewer";

const GetDigipin = ({ isLoggedIn }) => {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [result, setResult] = useState(null);
  const [formattedDigipin, setFormattedDigipin] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const latVal = parseFloat(lat);
    const lngVal = parseFloat(lng);

    if (isNaN(latVal) || isNaN(lngVal)) {
      alert("Please enter valid numbers for latitude and longitude.");
      return;
    }

    if (latVal < 8 || latVal > 37) {
      alert("Latitude must be between 8 and 37.");
      return;
    }

    if (lngVal < 68 || lngVal > 98) {
      alert("Longitude must be between 68 and 98.");
      return;
    }
      const res = await fetchDigipin(lat, lng);
      setResult(res.data);

      const clean = res.data.digipin.replace(/-/g, "");
      setFormattedDigipin(clean);
    };

  const handleSave = async () => {
    // later call save API
    alert("Saving DIGIPIN is only a demo now.");
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Latitude" />
        <input value={lng} onChange={(e) => setLng(e.target.value)} placeholder="Longitude" />
        <button type="submit">Get DIGIPIN</button>
      </form>

      {result && (
        <div>
          <p><strong>DIGIPIN:</strong> {result.digipin}</p>

          {isLoggedIn && (
            <button onClick={handleSave}>Save to My Account</button>
          )}
          <QrCodeViewer digipin={formattedDigipin} />
        </div>
      )}
    </div>
  );
};

export default GetDigipin;

