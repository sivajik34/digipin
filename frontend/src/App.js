import React, { useState, useEffect } from "react";
import "./App.css";
import GetDigipin from "./components/GetDigipin";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import DecodeDigipin from "./components/DecodeDigipin";
import MyDigipins from "./components/MyDigipins";
import { getCurrentUser } from "./services/api";
import Modal from "react-modal";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

Modal.setAppElement("#root");

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState("login"); // or "register"


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
        <header style={{ padding: "10px", backgroundColor: "#f2f2f2" }}>
          <h1>DIGIPIN Finder</h1>
          <nav style={{ marginBottom: "10px" }}>
            <Link to="/">Home</Link> |{" "}
            <Link to="/decode">Decode DIGIPIN</Link> |{" "}
            {isLoggedIn && <Link to="/my-digipins">My DIGIPINs</Link>} |{" "}
            {!isLoggedIn ? (
              <>
                <button onClick={() => { setModalContent("login"); setModalIsOpen(true); }}>Login</button>{" "}
                <button onClick={() => { setModalContent("register"); setModalIsOpen(true); }}>Register</button>
              </>
            ) : (
              <>
                <span>Welcome, {email}</span>{" "}
                <button onClick={handleLogout}>Logout</button>
              </>
            )}
          </nav>
        </header>

        <main className="main-content">         

          <Routes>
            <Route path="/" element={<GetDigipin isLoggedIn={isLoggedIn} />} />
            <Route path="/decode" element={<DecodeDigipin />} />
            <Route
              path="/my-digipins"
              element={isLoggedIn ? <MyDigipins /> : <Navigate to="/" replace />}
            />
          </Routes>
        </main>

        <footer className="footer">
          <p>&copy; 2025 DIGIPIN Finder | <a href="https://digipincode.com">digipincode.com</a></p>
        </footer>

        <ToastContainer position="top-right" autoClose={3000} />
      <Modal
  isOpen={modalIsOpen}
  onRequestClose={() => setModalIsOpen(false)}
  contentLabel={modalContent === "login" ? "Login" : "Register"}
  style={{
    content: {
      maxWidth: "400px",
      margin: "auto",
      padding: "20px",
      borderRadius: "10px"
    }
  }}
>
  <button onClick={() => setModalIsOpen(false)} style={{ float: "right" }}>X</button>
  {modalContent === "login" ? (
    <LoginForm
      onLogin={() => {
        window.location.reload();
        setModalIsOpen(false);
      }}
    />
  ) : (
    <RegisterForm
      onRegister={() => {
        alert("Registered! Now login.");
        setModalContent("login");
      }}
    />
  )}
</Modal>

      </div>
    </Router>
  );
}

export default App;
