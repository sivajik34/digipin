import React from "react";
import {
  WhatsappShareButton,
  WhatsappIcon,
  TelegramShareButton,
  TelegramIcon,
  EmailShareButton,
  EmailIcon,
} from "react-share";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ShareDigipin = ({ digipin }) => {
  const shareText = `Here is my DIGIPIN: ${digipin}`;
  const shareUrl = "https://digipincode.com";

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "DIGIPIN",
          text: shareText,
          url: shareUrl,
        });
        toast.success("Shared successfully via native share!");
      } catch (err) {
        toast.error("Share cancelled or failed.");
      }
    }
  };

  return (
    <div style={{ marginTop: "10px" }}>
      <h4>Share your DIGIPIN</h4>
      {navigator.share ? (
        <button onClick={handleNativeShare} style={{ padding: "8px 12px", cursor: "pointer" }}>
          📤 Share DIGIPIN
        </button>
      ) : (
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "10px" }}>
          <WhatsappShareButton url={shareUrl} title={shareText}>
            <WhatsappIcon size={32} round />
          </WhatsappShareButton>
          <TelegramShareButton url={shareUrl} title={shareText}>
            <TelegramIcon size={32} round />
          </TelegramShareButton>
          <EmailShareButton subject="Check out my DIGIPIN" body={shareText}>
            <EmailIcon size={32} round />
          </EmailShareButton>
        </div>
      )}
    </div>
  );
};

export default ShareDigipin;
