import React, { useState } from "react";
import LoginForm from "../pages/Login";
import SignupForm from "../pages/Signup";

const AuthModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState("login");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6">
        {mode === "login" ? (
          <LoginForm onSwitch={() => setMode("signup")} />
        ) : (
          <SignupForm onSwitch={() => setMode("login")} />
        )}

        <div className="mt-2 text-center">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
