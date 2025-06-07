import React, { useState, useEffect } from "react";
import './App.css';
import GetDigipin from './components/GetDigipin';
import LoginForm from './components/LoginForm';
import RegisterForm from "./components/RegisterForm";
import DecodeDigipin from "./components/DecodeDigipin";
import { getCurrentUser } from "./services/api";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import MyDigipins from "./components/MyDigipins";
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
    <Router>
      <div className="App">
        <h1>DIGIPIN Finder</h1>

        <nav style={{ marginBottom: "20px" }}>
          <Link to="/">Home</Link> |{" "}
          <Link to="/decode">Decode DIGIPIN</Link> |{" "}
          {isLoggedIn && <Link to="/my-digipins">My DIGIPINs</Link>}
        </nav>

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

        <Routes>
          <Route path="/" element={<GetDigipin isLoggedIn={isLoggedIn} />} />
          <Route path="/decode" element={<DecodeDigipin />} />
          <Route
            path="/my-digipins"
            element={
              isLoggedIn ? <MyDigipins /> : <Navigate to="/" replace />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

