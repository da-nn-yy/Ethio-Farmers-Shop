import React, { useEffect, useState } from "react";
import LoginForm from "../pages/Login";
import SignupForm from "../pages/Signup";

const AuthModal = ({ isOpen, onClose, initialMode = "login" }) => {
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => onClose?.()}
      aria-hidden={!isOpen}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
          aria-label="Close modal"
        >
          &times;
        </button>

        <h2 id="auth-modal-title" className="sr-only">Authentication Modal</h2>

        {mode === "login" ? (
          <LoginForm onSuccess={onClose} />
        ) : (
          <SignupForm onSuccess={onClose} />
        )}

        <div className="mt-4 text-center">
          {mode === "login" ? (
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-[#006C36] font-medium hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-[#006C36] font-medium hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
