// src/components/QrCodeViewer.js
import React from "react";
import { getQrCodeUrl, getQrDownloadUrl } from "../services/api";

const QrCodeViewer = ({ digipin }) => {
  const qrUrl = getQrCodeUrl(digipin);
  const downloadUrl = getQrDownloadUrl(digipin);

  return (
    <div style={{ marginTop: "20px" }}>
      <h4>QR Code for DIGIPIN</h4>
      <img src={qrUrl} alt={`QR for ${digipin}`} width="200" height="200" />
      <br />
      <a href={downloadUrl} download={`digipin_${digipin}.png`}>
        <button>Download QR Code</button>
      </a>
    </div>
  );
};

export default QrCodeViewer;
