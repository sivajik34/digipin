import React, { useState, useEffect } from "react";
import { fetchDigipin, saveUserDigipin } from "../services/api";
import QrCodeViewer from "./QrCodeViewer";

const GetDigipin = ({ isLoggedIn }) => {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [result, setResult] = useState(null);
  const [formattedDigipin, setFormattedDigipin] = useState("");
  const [locationError, setLocationError] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude.toFixed(6);
        const longitude = position.coords.longitude.toFixed(6);

        setLat(latitude);
        setLng(longitude);

        setGeoLoading(false);
        setApiLoading(true);
        try {
          const res = await fetchDigipin(latitude, longitude);
          setResult(res.data);
          setFormattedDigipin(res.data.digipin.replace(/-/g, ""));
          setLocationError(null);
        } catch {
          setLocationError("Failed to fetch DIGIPIN for your location.");
        }
        setApiLoading(false);
      },
      (error) => {
        setGeoLoading(false);
        setLocationError("Unable to retrieve your location or permission denied.");
      }
    );
  }, []);

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

    setApiLoading(true);
    try {
      const res = await fetchDigipin(latVal, lngVal);
      setResult(res.data);
      setFormattedDigipin(res.data.digipin.replace(/-/g, ""));
      setLocationError(null);
    } catch {
      alert("Failed to fetch DIGIPIN.");
    }
    setApiLoading(false);
  };

  const handleSave = async () => {
    try {
      const digipin = result.digipin.replace(/-/g, "");
      await saveUserDigipin(digipin);
      alert("DIGIPIN saved to your account.");
    } catch {
      alert("Failed to save DIGIPIN.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} aria-label="Manual latitude and longitude input">
        <input
          type="number"
          step="0.000001"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          placeholder="Latitude"
          aria-label="Latitude"
          disabled={geoLoading || apiLoading}
          required
        />
        <input
          type="number"
          step="0.000001"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          placeholder="Longitude"
          aria-label="Longitude"
          disabled={geoLoading || apiLoading}
          required
        />
        <button type="submit" disabled={geoLoading || apiLoading}>
          {apiLoading ? "Fetching..." : "Get DIGIPIN"}
        </button>
      </form>

      {geoLoading && <p>Detecting your location… Please allow location access.</p>}
      {locationError && <p style={{ color: "red" }}>{locationError}</p>}

      {result && (
        <div>
          <p>
            <strong>DIGIPIN:</strong> {result.digipin}
          </p>

          {isLoggedIn && (
            <button onClick={handleSave} disabled={apiLoading}>
              Save to My Account
            </button>
          )}

          <QrCodeViewer digipin={formattedDigipin} />
        </div>
      )}
    </div>
  );
};

export default GetDigipin;
