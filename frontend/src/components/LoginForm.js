// src/components/LoginForm.js
import React, { useState } from "react";
import { loginUser } from "../services/api";
import GoogleLoginButton from "./GoogleLoginButton";
const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(email, password);
      const token = res.data.access_token;
      localStorage.setItem("access_token", token);
      onLogin(token);
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div>
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Login</button>
    </form><div style={{ margin: "20px 0", textAlign: "center" }}>OR</div><GoogleLoginButton onLogin={onLogin} /></div>
    
  );
};

export default LoginForm;

