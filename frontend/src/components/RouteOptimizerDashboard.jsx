import React, { useState } from "react";

function OptimizeRouteForm({ onSubmit }) {
  const [vehicles, setVehicles] = useState(1);
  const [stops, setStops] = useState([
    { digipin: "", demand: 1, priority: 1, time_window: [0, 24] },
  ]);
  const [depot, setDepot] = useState(""); // Depot state for manual entry

  const handleStopChange = (index, field, value) => {
    const updatedStops = [...stops];
    if (field === "time_window_start") {
      updatedStops[index].time_window[0] = Number(value);
    } else if (field === "time_window_end") {
      updatedStops[index].time_window[1] = Number(value);
    } else if (field === "demand" || field === "priority") {
      updatedStops[index][field] = Number(value);
    } else {
      updatedStops[index][field] = value;
    }
    setStops(updatedStops);
  };

  const addStop = () => {
    setStops([
      ...stops,
      { digipin: "", demand: 1, priority: 1, time_window: [0, 24] },
    ]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const filteredStops = stops.filter((s) => s.digipin.trim() !== "");

    if (filteredStops.length === 0) {
      alert("Please enter at least one valid DIGIPIN.");
      return;
    }

    if (!depot.trim()) { // Check if depot is not just whitespace
      alert("Please enter a depot DIGIPIN.");
      return;
    }
    console.log("Submitting payload:", { depot, vehicles, locations: filteredStops });

    onSubmit({
      depot,
      vehicles,
      locations: filteredStops,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="vehicles">
          Number of Vehicles:
        </label>
        <input
          type="number"
          id="vehicles"
          min="1"
          value={vehicles}
          onChange={(e) => setVehicles(Number(e.target.value))}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      {stops.map((stop, i) => (
        <div key={i} className="border rounded p-4 mb-4 shadow-sm bg-white">
          <h3 className="text-lg font-semibold mb-2">Stop {i + 1}</h3>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`digipin-${i}`}>
              Digipin:
            </label>
            <input
              type="text"
              id={`digipin-${i}`}
              value={stop.digipin}
              onChange={(e) => handleStopChange(i, "digipin", e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`demand-${i}`}>
              Demand:
            </label>
            <input
              type="number"
              id={`demand-${i}`}
              min="1"
              value={stop.demand}
              onChange={(e) => handleStopChange(i, "demand", e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`priority-${i}`}>
              Priority:
            </label>
            <input
              type="number"
              id={`priority-${i}`}
              min="1"
              max="3"
              value={stop.priority}
              onChange={(e) => handleStopChange(i, "priority", e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="flex flex-wrap -mx-2 mb-4">
            <div className="w-1/2 px-2">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`time_window_start-${i}`}>
                Time Window Start (minutes):
              </label>
              <input
                type="number"
                id={`time_window_start-${i}`}
                min="0"
                max="1440" /* Max 24 hours in minutes */
                value={stop.time_window[0]}
                onChange={(e) =>
                  handleStopChange(i, "time_window_start", e.target.value)
                }
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="w-1/2 px-2">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`time_window_end-${i}`}>
                Time Window End (minutes):
              </label>
              <input
                type="number"
                id={`time_window_end-${i}`}
                min="0"
                max="1440" /* Max 24 hours in minutes */
                value={stop.time_window[1]}
                onChange={(e) =>
                  handleStopChange(i, "time_window_end", e.target.value)
                }
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addStop}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Add Stop
      </button>

      {/* Depot Textbox for manual entry */}
      <div className="mt-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="depot">
          Depot Digipin:
        </label>
        <input
          type="text"
          id="depot"
          value={depot}
          onChange={(e) => setDepot(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      <div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline mt-4"
        >
          Optimize Route
        </button>
      </div>
    </form>
  );
}

export default OptimizeRouteForm;
