import React, { useState, useEffect } from "react";
import './App.css';
import GetDigipin from './components/GetDigipin';
import LoginForm from './components/LoginForm';
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

  return (
    <div className="App">
      <h1>DIGIPIN Finder</h1>

      {isLoggedIn && <p>Welcome, {email}</p>}

      {/* Show Login only if not logged in */}
      {!isLoggedIn && (
        <>
          <p>You're using DIGIPIN as a guest.</p>
          <LoginForm onLogin={() => window.location.reload()} />
        </>
      )}

      <GetDigipin isLoggedIn={isLoggedIn} />
    </div>
  );
}

export default App;

