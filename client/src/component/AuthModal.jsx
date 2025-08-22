import React, { useState } from "react";
import LoginForm from "../pages/Login";
import SignupForm from "../pages/Signup";

const AuthModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState("login"); // 'login' or 'signup'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-lg p-6">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
          aria-label="Close modal"
        >
          &times;
        </button>

        {/* Mode Switcher */}
        <div className="mb-4 flex justify-center gap-2">
          <button
            onClick={() => setMode("login")}
            className={`px-4 py-2 rounded-md font-medium ${
              mode === "login" ? "bg-[#006C36] text-white" : "bg-gray-200"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`px-4 py-2 rounded-md font-medium ${
              mode === "signup" ? "bg-[#006C36] text-white" : "bg-gray-200"
            }`}
          >
            Signup
          </button>
        </div>

        {/* Form Content */}
        <div>{mode === "login" ? <LoginForm /> : <SignupForm />}</div>
      </div>
    </div>
  );
};

export default AuthModal;
