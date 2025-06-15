import React, { useState, useEffect } from "react";
import { saveEvent } from "../services/api";
import { toast } from "react-toastify";
import QrCodeViewer from "./QrCodeViewer";
import LocationMap from "./LocationMap";
import { useDigipin } from "../hooks/useDigipin";

const CreateEvent = () => {
  const [title, setTitle] = useState("");
  const [datetime, setDatetime] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [digipin, setDigipin] = useState("");
  const [eventId, setEventId] = useState(null);
  const [loading, setLoading] = useState(false);

  const { encodeDigipin } = useDigipin();

  // Auto-detect location on mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude.toFixed(6);
        const longitude = position.coords.longitude.toFixed(6);
        setLat(latitude);
        setLng(longitude);
        try {
          const res = await encodeDigipin(latitude, longitude);
          setDigipin(res.digipin);
        } catch {
          toast.error("Failed to fetch DIGIPIN.");
        }
      },
      (err) => {
        toast.error("Failed to get location.");
        console.error(err);
      }
    );
  }, [encodeDigipin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !datetime || !lat || !lng || !digipin) {
      toast.warn("Please fill all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await saveEvent({
        title,
        start_time: datetime,
        description,
        latitude: parseFloat(lat),  // rename and convert to number
        longitude: parseFloat(lng), // rename and convert to number
        digipin,
      });
      setEventId(res.data?.id || null);
      toast.success("Event created!");
    } catch (err) {
      toast.error("Failed to create event.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onLocationSelect = async (newLat, newLng) => {
    const fixedLat = newLat.toFixed(6);
    const fixedLng = newLng.toFixed(6);
    setLat(fixedLat);
    setLng(fixedLng);
    try {
      const res = await encodeDigipin(fixedLat, fixedLng);
      setDigipin(res.digipin);
    } catch {
      toast.error("Failed to fetch DIGIPIN for new location.");
    }
  };
  const normalizedDigipin = digipin.replace(/-/g, "").toUpperCase();
  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h2 className="text-xl font-semibold">Create Event</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Event Title"
          className="w-full border px-3 py-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="datetime-local"
          className="w-full border px-3 py-2 rounded"
          value={datetime}
          onChange={(e) => setDatetime(e.target.value)}
        />

        <textarea
          placeholder="Description"
          className="w-full border px-3 py-2 rounded"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="bg-gray-50 p-3 rounded border">
          <p className="text-sm mb-2">📍 Event Location:</p>
          <p className="text-sm">Latitude: {lat}</p>
          <p className="text-sm">Longitude: {lng}</p>
          <p className="text-sm">DIGIPIN: <strong>{digipin}</strong></p>
        </div>

        <LocationMap
          onLocationSelect={onLocationSelect}
          marker={lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {loading ? "Saving..." : "Create Event"}
        </button>
      </form>

      {eventId && (
        <div className="mt-6">
          <p className="text-sm text-gray-700">✅ Event created successfully. Share the QR code:</p>
          <QrCodeViewer digipin={normalizedDigipin} suffix={`event-${eventId}`} />
        </div>
      )}
    </div>
  );
};

export default CreateEvent;
