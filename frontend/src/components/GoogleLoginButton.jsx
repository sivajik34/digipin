// src/components/GoogleLoginButton.jsx
import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import jwt_decode from "jwt-decode";
import { googleLogin } from "../services/api";

const GoogleLoginButton = ({ onLogin }) => {
  const handleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      const res = await googleLogin(token);
      localStorage.setItem("access_token", res.data.access_token);
      onLogin(res.data.access_token);
    } catch (err) {
      alert("Google login failed");
    }
  };

  const handleError = () => {
    alert("Google login failed");
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
      useOneTap
    />
  );
};

export default GoogleLoginButton;
