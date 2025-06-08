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
        toast.success("DIGIPIN shared successfully!");
      } catch (err) {
        toast.error("Sharing was cancelled or failed.");
      }
    } else {
      toast.warn("Native share not supported on this device.");
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg shadow-sm text-center">
      <h4 className="text-lg font-semibold mb-2">Share your DIGIPIN</h4>

      {navigator.share ? (
        <button
          onClick={handleNativeShare}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
        >
          📤 Share via Native Share
        </button>
      ) : (
        <div className="flex justify-center gap-4 mt-3">
          <WhatsappShareButton url={shareUrl} title={shareText}>
            <WhatsappIcon size={40} round />
          </WhatsappShareButton>
          <TelegramShareButton url={shareUrl} title={shareText}>
            <TelegramIcon size={40} round />
          </TelegramShareButton>
          <EmailShareButton subject="Check out my DIGIPIN" body={shareText}>
            <EmailIcon size={40} round />
          </EmailShareButton>
        </div>
      )}
    </div>
  );
};

export default ShareDigipin;
