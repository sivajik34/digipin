import React, { useState } from 'react';
import { fetchDigipin } from '../services/api';

function GetDigipin() {
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [digipin, setDigipin] = useState('');

  const handleFetch = async () => {
    try {
      const res = await fetchDigipin(lat, lng);
      setDigipin(res.data?.digipin || 'Not found');
    } catch (error) {
      console.error(error);
      setDigipin('Error fetching DIGIPIN');
    }
  };

  return (
    <div>
      <input placeholder="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} />
      <input placeholder="Longitude" value={lng} onChange={(e) => setLng(e.target.value)} />
      <button onClick={handleFetch}>Get DIGIPIN using Lat and Long</button>
      <p>Your DIGIPIN: {digipin}</p>
    </div>
  );
}

export default GetDigipin;


