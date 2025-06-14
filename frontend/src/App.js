import React, { useState, useEffect } from "react";
import GetDigipin from "./components/GetDigipin";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import GetLatLong from "./components/GetLatLong";
import MyDigipins from "./components/MyDigipins";
import { getCurrentUser } from "./services/api";
import Modal from "react-modal";
import { GoogleOAuthProvider } from "@react-oauth/google";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import digipincode from "./assets/digipincode.png";

import BulkQrGenerator from "./components/BulkQrGenerator";
import ProofOfLocation from "./components/ProofOfLocation";
import AdminUsersList from "./components/AdminUsersList";
import CreateEvent from "./components/CreateEvent";

const GOOGLE_CLIENT_ID =
  "616953302611-4iu6121c1j60b413cl75i80q60eakj8n.apps.googleusercontent.com";

Modal.setAppElement("#root");

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AppContent />
    </GoogleOAuthProvider>
  );
}

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState("login");
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await getCurrentUser();
        setIsLoggedIn(true);
        setEmail(res.data.email);
        setUserInfo(res.data);
      } catch {
        setIsLoggedIn(false);
        setUserInfo(null);
      }
    };
    checkUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    setEmail("");
    setUserInfo(null);
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-gray-100 p-4 flex flex-col items-center md:flex-row md:justify-between">
          <img src={digipincode} alt="DIGIPIN Logo" className="h-28 mb-2 md:mb-0" />
          <nav className="flex flex-wrap gap-4 text-blue-700 font-medium">
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/decode" className="hover:underline">Decode DIGIPIN</Link><Link to="/bulk-qr" className="hover:underline">Bulk QR Generator</Link>

            {isLoggedIn && (
              <Link to="/my-digipins" className="hover:underline">My DIGIPINs</Link>
            )}
            <Link to="/proof" className="hover:underline">Proof of Location</Link><Link to="/create-event" className="hover:underline">Create Event</Link>

           
            {isLoggedIn && userInfo?.is_superuser && (
  <Link to="/admin/users" className="hover:underline">Admin Users</Link>
)}
            {!isLoggedIn ? (
              <>
                <button
                  onClick={() => {
                    setModalContent("login");
                    setModalIsOpen(true);
                  }}
                  className="text-sm px-3 py-1 border border-blue-500 rounded hover:bg-blue-100"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setModalContent("register");
                    setModalIsOpen(true);
                  }}
                  className="text-sm px-3 py-1 border border-green-500 rounded hover:bg-green-100"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                <span className="text-sm">Welcome, {email}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm px-3 py-1 border border-red-500 rounded hover:bg-red-100"
                >
                  Logout
                </button>
              </>
            )}
            
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-grow p-4">
          <Routes>
          <Route
  path="/admin/users"
  element={
    isLoggedIn && userInfo?.is_superuser ? (
      <AdminUsersList />
    ) : (
      <Navigate to="/" replace />
    )
  }
/>
            <Route path="/" element={<GetDigipin isLoggedIn={isLoggedIn} />} />
            <Route path="/decode" element={<GetLatLong />} />
            <Route
              path="/my-digipins"
              element={
                isLoggedIn ? <MyDigipins /> : <Navigate to="/" replace />
              }
            /><Route path="/create-event" element={<CreateEvent />} />
           <Route path="/bulk-qr" element={<BulkQrGenerator />} />
<Route path="/proof" element={<ProofOfLocation />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-100 text-center text-sm py-3">
          &copy; 2025 DIGIPIN |{" "}
          <a
            href="https://digipincode.com"
            className="text-blue-600 hover:underline"
          >
            digipincode.com
          </a>
        </footer>

        {/* Toasts */}
        <ToastContainer position="top-right" autoClose={3000} />

        {/* Modal */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          contentLabel={modalContent === "login" ? "Login" : "Register"}
          className="bg-white max-w-md mx-auto mt-20 p-6 rounded-lg shadow-lg outline-none"
          overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start z-50"
        >
          <button
            onClick={() => setModalIsOpen(false)}
            className="float-right text-gray-500 hover:text-black"
          >
            ×
          </button>
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
