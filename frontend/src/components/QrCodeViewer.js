// src/components/QrCodeViewer.js
import React, { useState } from "react";
import Modal from "react-modal";
import { getQrCodeUrl, getQrDownloadUrl } from "../services/api";

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
      <h4>QR Code for DIGIPIN</h4>
      <button onClick={handleOpenModal}>Generate QR Code</button>

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
