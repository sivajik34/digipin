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
      () => {
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
    } catch {
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
    <div className="max-w-4xl mx-auto p-4 space-y-6">     

      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap gap-4 items-center mt-6"
      >
        <input
          type="text"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          placeholder="Latitude"
          disabled={geoLoading || apiLoading}
          className="border px-3 py-2 rounded w-full sm:w-auto"
        />
        <input
          type="text"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          placeholder="Longitude"
          disabled={geoLoading || apiLoading}
          className="border px-3 py-2 rounded w-full sm:w-auto"
        />
        <button
          type="submit"
          disabled={geoLoading || apiLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {apiLoading ? "Fetching..." : "Get DIGIPIN"}
        </button>
      </form>

      {geoLoading && <p className="text-gray-600">Detecting your location…</p>}
      {locationError && <p className="text-red-600">{locationError}</p>}

      {result && (
        <div className="bg-gray-50 p-4 rounded shadow space-y-4">
          <div className="flex flex-wrap gap-4 justify-center">
          <p className="text-lg font-semibold">
            DIGIPIN: <span className="text-blue-800">{result.digipin}</span>
          </p>

          

          {isLoggedIn && (
            <SaveDigipinForm
              digipin={result.digipin}
              onSaved={() => {
                // optional: refresh list
              }}
            />
          )}

          <QrCodeViewer digipin={formattedDigipin} />
          <OpenInGoogleMaps lat={lat} lng={lng} /><ShareDigipin digipin={result.digipin} /></div>
          <LocationMap
        onLocationSelect={handleSubmitFromMap}
        marker={lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null}
      />
        </div>
      )}
    </div>
  );
};

export default GetDigipin;
