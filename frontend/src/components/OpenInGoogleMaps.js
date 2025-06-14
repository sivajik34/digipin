// src/components/OpenInGoogleMaps.js
import React from "react";
import {
  //Copy,
  
  MapPin
  
} from "lucide-react";
const OpenInGoogleMaps = ({ lat, lng }) => {
  if (!lat || !lng) return null;

  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <a
      href={googleMapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-blue-600 transition"
      title="Open in Google Maps"
    >
      <MapPin className="w-5 h-5" />
    </a>
  );
};

export default OpenInGoogleMaps;
