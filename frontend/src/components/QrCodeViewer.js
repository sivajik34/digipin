// src/components/QrCodeViewer.js
import React, { useState } from "react";
import Modal from "react-modal";
import { getQrCodeUrl, getQrDownloadUrl } from "../services/api";
import { QrCode } from "lucide-react";
Modal.setAppElement("#root");

const QrCodeViewer = ({ digipin }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const handleOpenModal = () => {
    // Ensure digipin is valid before opening
    if (digipin && digipin.length === 10) {
      setShowQr(true);
      setModalIsOpen(true);
    } else {
      alert("Invalid DIGIPIN. Must be 10 characters.");
    }
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    setShowQr(false); // prevent loading QR if modal not visible
  };

  const qrUrl = getQrCodeUrl(digipin);
  const downloadUrl = getQrDownloadUrl(digipin);

  return (
    <div style={{ marginTop: "20px" }}>
      
      <button
  onClick={handleOpenModal} aria-label="Generate QR Code" 
  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 transform"
>
  <QrCode size={20} />
  
</button>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleCloseModal}
        contentLabel="QR Code"
        style={{
          content: {
            maxWidth: "300px",
            margin: "auto",
            padding: "20px",
            borderRadius: "10px",
            textAlign: "center",
          },
        }}
      >
        <button onClick={handleCloseModal} style={{ float: "right" }}>
          X
        </button>
        <h5 style={{ marginTop: "0" }}>DIGIPIN: {digipin}</h5>
        {showQr && (
          <>
            <img
              src={qrUrl}
              alt={`QR for ${digipin}`}
              width="200"
              height="200"
              style={{ margin: "10px 0" }}
              onError={() => alert("Failed to load QR code.")}
            />
            <br />
            <a href={downloadUrl} download={`digipin_${digipin}.png`}>
              <button>Download QR Code</button>
            </a>
          </>
        )}
      </Modal>
    </div>
  );
};

export default QrCodeViewer;
