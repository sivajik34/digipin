import React, { useState, useEffect } from "react";
import './App.css';
import GetDigipin from './components/GetDigipin';
import LoginForm from './components/LoginForm';
import RegisterForm from "./components/RegisterForm";
import DecodeDigipin from "./components/DecodeDigipin";
import { getCurrentUser } from "./services/api";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await getCurrentUser();
        setIsLoggedIn(true);
        setEmail(res.data.email);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkUser();
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    setEmail("");
  };


  return (
    <div className="App">
      <h1>DIGIPIN Finder</h1>

      {isLoggedIn ? (
        <>
          <p>Welcome, {email}</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <p>You're using DIGIPIN as a guest.</p>
          <LoginForm onLogin={() => window.location.reload()} />
          <RegisterForm onRegister={() => alert("Now login with your new account")} />
        </>
      )}

      <GetDigipin isLoggedIn={isLoggedIn} />
      <DecodeDigipin />
    </div>
  );
}

export default App;

