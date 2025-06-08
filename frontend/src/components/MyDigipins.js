import React, { useEffect, useState } from "react";
import {
  listUserDigipins,
  deleteUserDigipin,
  decodeDigipin,
} from "../services/api";
import { formatDigipin } from "../utils/format";
import Button from "./ui/button";
import QrCodeViewer from "./QrCodeViewer";

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
        console.error("Error fetching saved DIGIPINs", err);
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
    } catch (err) {
      alert("Failed to delete DIGIPIN");
    }
  };

  const handleCopy = (digipin) => {
    navigator.clipboard.writeText(formatDigipin(digipin));
    alert("DIGIPIN copied to clipboard");
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

      if (isNaN(lat) || isNaN(lng)) {
        throw new Error("Invalid coordinates received.");
      }
      setCoordsMap((prev) => ({ ...prev, [dp.id]: { lat, lng } }));
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
    } catch (err) {
      alert("Failed to decode DIGIPIN");
      console.error(err);
    } finally {
      setLoadingCoords((prev) => ({ ...prev, [dp.id]: false }));
    }
  };

  if (loading) return <p>Loading your DIGIPINs...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">My Saved DIGIPINs</h2>
      {digipins.length === 0 ? (
        <p>You have not saved any DIGIPINs yet.</p>
      ) : (
        <ul className="space-y-3">
          {digipins.map((dp) => (
            <li
              key={dp.id}
              className="flex justify-between items-center border p-3 rounded shadow-sm"
            >
              <div>
                <p className="font-mono text-lg">{formatDigipin(dp.digipin)}</p>
                <small className="text-gray-500">
                  Saved on {new Date(dp.created_at).toLocaleString()}
                </small>
              </div>
              <div className="flex items-center space-x-2">
                <QrCodeViewer digipin={dp.digipin} />
                <Button
                  variant="default"
                  onClick={() => handleOpenInMaps(dp)}
                  disabled={loadingCoords[dp.id]}
                >
                  {loadingCoords[dp.id] ? "Loading…" : "Open in Maps"}
                </Button>
                <Button variant="outline" onClick={() => handleCopy(dp.digipin)}>
                  Copy
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(dp.id)}>
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyDigipins;
