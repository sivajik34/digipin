import React, { useState } from "react";
import { toast } from "react-toastify";
import { saveUserDigipin } from "../services/api";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Validation schema
const schema = yup.object().shape({
  friendlyName: yup
    .string()
    .trim()
    .required("Friendly name is required")
    .max(50, "Name too long"),
});

const SaveDigipinForm = ({ digipin, onSaved }) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const cleanDigipin = digipin.replace(/-/g, "");
      await saveUserDigipin(cleanDigipin, data.friendlyName.trim());
      toast.success("DIGIPIN saved successfully!");
      reset();
      if (onSaved) onSaved();
    } catch (error) {
      toast.error("Failed to save DIGIPIN.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex items-center gap-2 flex-wrap">
      <input
        {...register("friendlyName")}
        type="text"
        placeholder="Friendly name (e.g. Home, Office)"
        className="px-3 py-2 border rounded-md w-64"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
      >
        {loading ? "Saving..." : "Save DIGIPIN"}
      </button>
      {errors.friendlyName && (
        <p className="text-red-600 text-sm mt-1">{errors.friendlyName.message}</p>
      )}
    </form>
  );
};

export default SaveDigipinForm;
