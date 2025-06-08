import React, { useEffect, useState } from "react";
import { listUserDigipins, deleteUserDigipin } from "../services/api";
import { formatDigipin } from "../utils/format";
import Button from "./ui/button";
import QrCodeViewer from "./QrCodeViewer";  // import here

const MyDigipins = () => {
  const [digipins, setDigipins] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchDigipins();
  }, []);

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
