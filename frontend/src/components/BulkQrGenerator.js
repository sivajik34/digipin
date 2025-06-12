import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

export default function BulkQrGenerator() {
  const [digipins, setDigipins] = useState("");
  const [format, setFormat] = useState("json");
  const [imgFormat, setImgFormat] = useState("png");
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const digipinList = rows
        .map((row) => row[0]) // first column
        .filter((pin) => typeof pin === "string" && pin.trim() !== "")
        .map((pin) => pin.trim());

      setDigipins(digipinList.join("\n"));
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/qr/bulk`,
        {
          digipins: digipins.split("\n").map((pin) => pin.trim()).filter(Boolean),
          format,
          img_format: imgFormat,
        },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "digipins_qr_codes.zip");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      alert("Failed to generate QR codes: " + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-6 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Bulk QR Code Generator</h2>

      <textarea
        rows="6"
        placeholder="Enter one DIGIPIN per line or upload a CSV/Excel file"
        value={digipins}
        onChange={(e) => setDigipins(e.target.value)}
        className="w-full p-3 border rounded mb-4 resize-none"
      />

      <input
        type="file"
        accept=".csv, .xlsx"
        onChange={handleFileUpload}
        className="mb-4"
      />

      <div className="flex gap-4 mb-4">
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          className="p-2 border rounded flex-1"
        >
          <option value="json">JSON</option>
          <option value="text">Text</option>
          <option value="vcard">vCard</option>
        </select>

        <select
          value={imgFormat}
          onChange={(e) => setImgFormat(e.target.value)}
          className="p-2 border rounded flex-1"
        >
          <option value="png">PNG</option>
          <option value="svg">SVG</option>
        </select>
      </div>

      <button
        onClick={handleDownload}
        disabled={loading}
        className={`w-full py-2 rounded text-white ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Generating..." : "Download ZIP"}
      </button>
    </div>
  );
}
