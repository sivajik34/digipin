import React, { useState, useEffect } from "react";
import { fetchDigipin, saveUserDigipin } from "../services/api";
import QrCodeViewer from "./QrCodeViewer";
import ShareDigipin from "./ShareDigipin";
import LocationMap from "./LocationMap";
import { toast } from "react-toastify";
import OpenInGoogleMaps from "./OpenInGoogleMaps";
import SaveDigipinForm from "./SaveDigipinForm";


const GetDigipin = ({ isLoggedIn }) => {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [result, setResult] = useState(null);
  const [formattedDigipin, setFormattedDigipin] = useState("");
  const [locationError, setLocationError] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    const storedLat = sessionStorage.getItem("digipin_lat");
    const storedLng = sessionStorage.getItem("digipin_lng");
    const storedDigipin = sessionStorage.getItem("digipin_result");
    const storedFormatted = sessionStorage.getItem("digipin_formatted");

    if (storedLat && storedLng && storedDigipin && storedFormatted) {
      setLat(storedLat);
      setLng(storedLng);
      setResult(JSON.parse(storedDigipin));
      setFormattedDigipin(storedFormatted);
      return;
    }

    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported.");
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude.toFixed(6);
        const longitude = pos.coords.longitude.toFixed(6);
        setLat(latitude);
        setLng(longitude);
        try {
          setApiLoading(true);
          const res = await fetchDigipin(latitude, longitude);
          setResult(res.data);
          const clean = res.data.digipin.replace(/-/g, "");
          setFormattedDigipin(clean);

          // Store only auto-fetch to sessionStorage
          sessionStorage.setItem("digipin_lat", latitude);
          sessionStorage.setItem("digipin_lng", longitude);
          sessionStorage.setItem("digipin_result", JSON.stringify(res.data));
          sessionStorage.setItem("digipin_formatted", clean);
        } catch (err) {
          setLocationError("DIGIPIN fetch failed.");
        } finally {
          setApiLoading(false);
          setGeoLoading(false);
        }
      },
      (err) => {
        setGeoLoading(false);
        setLocationError("Location permission denied or failed.");
      }
    );
  }, []);

  const fetchAndSetDigipin = async (latVal, lngVal) => {
    try {
      setApiLoading(true);
      const res = await fetchDigipin(latVal, lngVal);
      setResult(res.data);
      setFormattedDigipin(res.data.digipin.replace(/-/g, ""));
      return true;
    } catch (err) {
      toast.error("Failed to fetch DIGIPIN.");
      return false;
    } finally {
      setApiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const latVal = parseFloat(lat);
    const lngVal = parseFloat(lng);

    if (isNaN(latVal) || isNaN(lngVal)) return toast.warn("Invalid coordinates.");
    if (latVal < 8 || latVal > 37 || lngVal < 68 || lngVal > 98)
      return toast.warn("Coordinates out of India boundary.");

    await fetchAndSetDigipin(latVal, lngVal);
  };

  const handleSubmitFromMap = async (latVal, lngVal) => {
    setLat(latVal.toFixed(6));
    setLng(lngVal.toFixed(6));

    if (latVal < 8 || latVal > 37 || lngVal < 68 || lngVal > 98)
      return toast.warn("Selected location is outside India.");

    await fetchAndSetDigipin(latVal, lngVal);
  };

  const handleSave = async () => {
    try {
      const digipin = result.digipin.replace(/-/g, "");
      await saveUserDigipin(digipin);
      toast.success("DIGIPIN saved successfully.");
    } catch {
      toast.error("Failed to save DIGIPIN.");
    }
  };

  return (
    <div>
      <LocationMap
        onLocationSelect={handleSubmitFromMap}
        marker={lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null}
      />

      <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
        <input
          type="text"          
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          placeholder="Latitude"
          disabled={geoLoading || apiLoading}
        />
        <input
          type="text"          
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          placeholder="Longitude"
          disabled={geoLoading || apiLoading}
        />
        <button type="submit" disabled={geoLoading || apiLoading}>
          {apiLoading ? "Fetching..." : "Get DIGIPIN"}
        </button>
      </form>

      {geoLoading && <p>Detecting your location…</p>}
      {locationError && <p style={{ color: "red" }}>{locationError}</p>}

      {result && (
        <div style={{ marginTop: "1rem" }}>
          <p>
            <strong>DIGIPIN:</strong> {result.digipin}
          </p>
          <ShareDigipin digipin={result.digipin} />
          {isLoggedIn && (
             <SaveDigipinForm digipin={result.digipin} onSaved={() => {
        // Optional: any action on successful save, e.g. refresh list
      }} />
          )}
          <QrCodeViewer digipin={formattedDigipin} />
          <OpenInGoogleMaps lat={lat} lng={lng} />
        </div>
      )}
    </div>
  );
};

export default GetDigipin;
