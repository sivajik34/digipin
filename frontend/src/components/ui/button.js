// src/components/ui/button.js
import React from "react";

const Button = ({ children, ...props }) => {
  return (
    <button
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
