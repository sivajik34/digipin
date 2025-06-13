import React, { useState } from "react";
import { downloadProofOfLocation } from "../services/api";

export default function ProofOfLocation() {
  const [digipin, setDigipin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await downloadProofOfLocation(digipin);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `location_proof_${digipin}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert("Failed to generate proof: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Location Proof Generator</h2>
      <input
        type="text"
        value={digipin}
        onChange={(e) => setDigipin(e.target.value)}
        placeholder="Enter DIGIPIN"
        className="w-full p-2 border rounded mb-4"
      />
      <button
        onClick={handleDownload}
        disabled={loading || !digipin}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Generating..." : "Download Proof PDF"}
      </button>
    </div>
  );
}
