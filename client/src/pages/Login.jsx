import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword,signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebaseConfig";
import { Loader2, Info, AlertCircle } from "lucide-react";

const LoginForm = ({ onSwitch, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isDemoMode = true;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (onSuccess) onSuccess();
      window.location.href = "/";
    } catch (err) {
      setError("Failed to log in: " + err.message);
    }
    setLoading(false);
  };

  const handleSignInWithGoogle = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithPopup(auth, googleProvider);
      if (onSuccess) onSuccess();
      navigate("/");
    } catch (error) {
      setError("Google sign-in failed. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-4">
        <h2 className="text-2xl font-serif font-semibold text-gray-900">Welcome Back</h2>
        <p className="text-sm text-gray-500">Sign in to your Ethio Farmers account</p>
      </div>

      {isDemoMode && (
        <div className="flex items-start gap-2 rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-[#006C36] mb-4">
          <Info className="h-4 w-4 mt-0.5" />
          <p>
            Demo Mode: Use any email/password. Try "farmer@demo.com" or "buyer@demo.com"
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 mb-4">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-[#006C36] focus:ring focus:ring-blue-200"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-[#006C36] focus:ring focus:ring-green-300"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-md bg-[#006C36] px-4 py-2 text-white font-medium shadow hover:bg-[#006C36]/80 focus:outline-none focus:ring focus:ring-green-300 disabled:opacity-70"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign In
        </button>

        <button
        onClick={handleSignInWithGoogle}
        className="w-full mt-2 rounded-md border border-gray-300 py-2 flex items-center justify-center gap-2 hover:bg-gray-100 text-md"
      >
        <img src="/search.png" alt="Google logo" className="w-5 h-5" />
        Sign in with Google
      </button>

      </form>

    </div>
  );
}

export default LoginForm;
