// src/components/GetDigipin.js
import React, { useState } from "react";
import { fetchDigipin } from "../services/api";

const GetDigipin = ({ isLoggedIn }) => {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetchDigipin(lat, lng);
    setResult(res.data);
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
        </div>
      )}
    </div>
  );
};

export default GetDigipin;

