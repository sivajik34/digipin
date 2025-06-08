// src/components/OpenInGoogleMaps.js
import React from "react";

const OpenInGoogleMaps = ({ lat, lng }) => {
  if (!lat || !lng) return null;

  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <a
      href={googleMapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 transform"
    >
      Open in Google Maps
    </a>
  );
};

export default OpenInGoogleMaps;
