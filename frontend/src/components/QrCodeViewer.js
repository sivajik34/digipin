import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { getQrCode, getQrCodeDownload } from "../services/api";
import { QrCode, X } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
Modal.setAppElement("#root");

const QrCodeViewer = ({ digipin }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [format, setFormat] = useState("png"); // or "svg"

  const handleOpenModal = () => {
    if (digipin && digipin.length === 10) {
      setModalIsOpen(true);
    } else {
      toast.warning("Invalid DIGIPIN. Must be 10 characters.");
    }
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    setShowQr(false);
  };

  useEffect(() => {
    if (modalIsOpen) {
      const timer = setTimeout(() => setShowQr(true), 150);
      return () => clearTimeout(timer);
    }
  }, [modalIsOpen]);

  const qrUrl = getQrCode(digipin, format);
  const downloadUrl = getQrCodeDownload(digipin, format);

  return (
    <div className="mt-4 text-center">
      <button
        onClick={handleOpenModal}
        aria-label="Generate QR Code"
        className="hover:text-blue-600 transition"
      >
        <QrCode size={20} />
      </button>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleCloseModal}
        contentLabel="QR Code Modal"
        style={{
          content: {
            maxWidth: "360px",
            margin: "auto",
            padding: "1.5rem",
            borderRadius: "10px",
            textAlign: "center",
          },
        }}
      >
        <div className="flex justify-between items-center mb-2">
          <button onClick={handleCloseModal} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-2">DIGIPIN: {digipin}</p>

        {/* Format Toggle */}
        <div className="mb-3">
          <label className="mr-2 text-sm">Format:</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="border p-1 rounded text-sm"
          >
            <option value="png">PNG</option>
            <option value="svg">SVG</option>
          </select>
        </div>

        {showQr && (
          <>
            {format === "svg" ? (
              <object
                data={qrUrl}
                type="image/svg+xml"
                width="200"
                height="200"
                className="mx-auto my-4 border rounded"
                onError={() => toast.error("Failed to load SVG QR code.")}
              >
                SVG Not Supported
              </object>
            ) : (
              <img
                src={qrUrl}
                alt={`QR for ${digipin}`}
                width="200"
                height="200"
                className="mx-auto my-4 border rounded"
                onError={() => toast.error("Failed to load PNG QR code.")}
              />
            )}

            <a href={downloadUrl} download={`digipin_${digipin}.${format}`}>
              <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded shadow">
                Download QR Code
              </button>
            </a>
          </>
        )}
      </Modal>
    </div>
  );
};
export default QrCodeViewer;
