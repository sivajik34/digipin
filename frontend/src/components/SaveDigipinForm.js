// src/components/SaveDigipinForm.js
import React, { useState } from "react";
import { toast } from "react-toastify";
import { saveUserDigipin } from "../services/api";

const SaveDigipinForm = ({ digipin, onSaved }) => {
  const [friendlyName, setFriendlyName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!friendlyName.trim()) {
      return toast.warn("Please enter a friendly name.");
    }

    try {
      setLoading(true);
      const cleanDigipin = digipin.replace(/-/g, "");
      await saveUserDigipin(cleanDigipin, friendlyName.trim());
      toast.success("DIGIPIN saved successfully!");
      setFriendlyName("");
      if (onSaved) onSaved();
    } catch (error) {
      toast.error("Failed to save DIGIPIN.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} style={{ marginTop: "1rem" }}>
      <input
        type="text"
        placeholder="Friendly name (e.g. Home, Office)"
        value={friendlyName}
        onChange={(e) => setFriendlyName(e.target.value)}
        disabled={loading}
        style={{ marginRight: "0.5rem" }}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save DIGIPIN"}
      </button>
    </form>
  );
};

export default SaveDigipinForm;
