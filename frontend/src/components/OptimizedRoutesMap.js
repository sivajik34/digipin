import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getLatlng, optimizeRoute } from "../services/api";

const COLORS = ["red", "blue", "green", "orange", "purple", "cyan"];

const OptimizedRoutesMap = ({ request }) => {
  const [routes, setRoutes] = useState([]);
  const [coordinates, setCoordinates] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await optimizeRoute(request);
      setRoutes(res.data.routes);

      const pins = [...new Set(res.data.routes.flatMap(r => r.stops))];
      const coordMap = {};
      for (const pin of pins) {
        const resp = await getLatlng(pin);
        coordMap[pin] = [resp.data.latitude, resp.data.longitude];
      }
      setCoordinates(coordMap);
    } catch (error) {
      console.error("Optimization error:", error);
    } finally {
      setLoading(false);
    }
  };
  fetchRoutes();
}, [request]);

  const bounds = Object.values(coordinates);
  const center = bounds.length ? bounds[0] : [20.5937, 78.9629];
  if (loading) return <div className="text-center text-blue-600">Optimizing routes...</div>;

  return (
    <div className="h-[600px] w-full rounded-xl overflow-hidden shadow">
      <MapContainer center={center} zoom={6} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {routes.map((route, i) => (
          <Polyline
            key={i}
            positions={route.stops.map(p => coordinates[p])}
            color={COLORS[i % COLORS.length]}
          />
        ))}
        {Object.entries(coordinates).map(([digipin, [lat, lng]]) => (
          <Marker key={digipin} position={[lat, lng]}>
            <Tooltip>{digipin}</Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default OptimizedRoutesMap;
