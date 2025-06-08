import React, { useEffect, useState } from "react";
import {
  listUserDigipins,
  deleteUserDigipin,
  decodeDigipin,
} from "../services/api";
import { formatDigipin } from "../utils/format";
import QrCodeViewer from "./QrCodeViewer";
import { toast, ToastContainer } from "react-toastify";
import {
  Copy,
  Trash2,
  MapPin,
  Loader2,
  BookmarkCheck,
} from "lucide-react";

const MyDigipins = () => {
  const [digipins, setDigipins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coordsMap, setCoordsMap] = useState({});
  const [loadingCoords, setLoadingCoords] = useState({});

  useEffect(() => {
    const fetchDigipins = async () => {
      try {
        const res = await listUserDigipins();
        setDigipins(res.data);
      } catch (err) {
        toast.error("Failed to load DIGIPINs.");
      } finally {
        setLoading(false);
      }
    };
    fetchDigipins();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this DIGIPIN?")) return;
    try {
      await deleteUserDigipin(id);
      setDigipins(digipins.filter((d) => d.id !== id));
      toast.success("DIGIPIN deleted.");
    } catch (err) {
      toast.error("Failed to delete DIGIPIN.");
    }
  };

  const handleCopy = (digipin) => {
    navigator.clipboard.writeText(formatDigipin(digipin));
    toast.info("DIGIPIN copied to clipboard.");
  };

  const handleOpenInMaps = async (dp) => {
    if (coordsMap[dp.id]) {
      const { lat, lng } = coordsMap[dp.id];
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
      return;
    }

    setLoadingCoords((prev) => ({ ...prev, [dp.id]: true }));

    try {
      const res = await decodeDigipin(dp.digipin);
      const { latitude, longitude } = res.data;
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (isNaN(lat) || isNaN(lng)) throw new Error("Invalid coordinates");
      setCoordsMap((prev) => ({ ...prev, [dp.id]: { lat, lng } }));
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
    } catch (err) {
      toast.error("Failed to decode DIGIPIN.");
    } finally {
      setLoadingCoords((prev) => ({ ...prev, [dp.id]: false }));
    }
  };

  if (loading) return <p className="p-4">Loading your DIGIPINs...</p>;

  return (
    <div className="p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
        <BookmarkCheck className="text-green-600" /> My Saved DIGIPINs
      </h2>
      {digipins.length === 0 ? (
        <p className="text-gray-600">You have not saved any DIGIPINs yet.</p>
      ) : (
        <ul className="space-y-4">
          {digipins.map((dp) => (
            <li
              key={dp.id}
              className="flex justify-between items-center border p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                {dp.user_friendly_name && (
      <p className="font-semibold text-indigo-700 mb-1">{dp.user_friendly_name}</p>
    )}
                <p className="font-mono text-lg">{formatDigipin(dp.digipin)}</p>
                <small className="text-gray-500 block mt-1">
                  Saved on {new Date(dp.created_at).toLocaleString()}
                </small>
              </div>
              <div className="flex items-center gap-3">
                <QrCodeViewer digipin={dp.digipin} />

                <button
                  onClick={() => handleOpenInMaps(dp)}
                  disabled={loadingCoords[dp.id]}
                  title="Open in Google Maps"
                  className="hover:text-blue-600 transition"
                >
                  {loadingCoords[dp.id] ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <MapPin className="w-5 h-5" />
                  )}
                </button>

                <button
                  onClick={() => handleCopy(dp.digipin)}
                  title="Copy DIGIPIN"
                  className="hover:text-green-600 transition"
                >
                  <Copy className="w-5 h-5" />
                </button>

                <button
                  onClick={() => handleDelete(dp.id)}
                  title="Delete DIGIPIN"
                  className="hover:text-red-600 transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyDigipins;
