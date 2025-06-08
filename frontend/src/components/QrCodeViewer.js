import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { getQrCodeUrl, getQrDownloadUrl } from "../services/api";
import { QrCode, X } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

Modal.setAppElement("#root");

const QrCodeViewer = ({ digipin }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [showQr, setShowQr] = useState(false);

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

  const qrUrl = getQrCodeUrl(digipin);
  const downloadUrl = getQrDownloadUrl(digipin);

  return (
    <div className="mt-4 text-center">
      <button
        onClick={handleOpenModal}
        aria-label="Generate QR Code"
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow transition-transform hover:scale-105 mx-auto"
      >
        <QrCode size={20} />
        Show QR Code
      </button>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleCloseModal}
        contentLabel="QR Code Modal"
        style={{
          content: {
            maxWidth: "320px",
            margin: "auto",
            padding: "1.5rem",
            borderRadius: "10px",
            textAlign: "center",
          },
        }}
      >
        <div className="flex justify-between items-center mb-2">
          <h5 className="text-lg font-semibold">DIGIPIN QR</h5>
          <button onClick={handleCloseModal} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-2">DIGIPIN: {digipin}</p>

        {showQr && (
          <>
            <img
              src={qrUrl}
              alt={`QR for ${digipin}`}
              width="200"
              height="200"
              className="mx-auto my-4 border rounded"
              onError={() => toast.error("Failed to load QR code.")}
            />
            <a href={downloadUrl} download={`digipin_${digipin}.png`}>
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
