import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { Loader2, Info, AlertCircle, User, Tractor } from "lucide-react";
import axios from "axios";

const  SignupForm = ({ onSwitch }) => {
  const [role, setRole] = useState("buyer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isDemoMode = true;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) return setError("Passwords do not match");

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();

      await axios.post(
        "http://localhost:5000/api/register",
        { email, role, name, phone, location },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onSwitch(); // switch to login after signup
    } catch (err) {
      setError("Failed to create account: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="text-center mb-4">
        <h2 className="text-2xl font-serif font-semibold text-gray-900">Join Ethio Farmers</h2>
        <p className="text-sm text-gray-500">Create your account to get started</p>
      </div>

      {isDemoMode && (
        <div className="flex items-start gap-2 rounded-lg border border-green-300 bg-blue-50 p-3 text-sm text-[#006C36] mb-4">
          <Info className="h-4 w-4 mt-0.5" />
          <p>
            Demo Mode: Create an account with any details. Include "farmer" in email for farmer role.
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
        {/* Role */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">I am a:</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="buyer"
                checked={role === "buyer"}
                onChange={() => setRole("buyer")}
                className="accent-green-600"
              />
              <User className="w-4 h-4" />
              Buyer
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="farmer"
                checked={role === "farmer"}
                onChange={() => setRole("farmer")}
                className="accent-green-600"
              />
              <Tractor className="w-4 h-4" />
              Farmer
            </label>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-green-500 focus:ring focus:ring-green-300"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-green-500 focus:ring focus:ring-green-300"
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-green-500 focus:ring focus:ring-green-300"
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Location (Optional)</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, Region"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-green-500 focus:ring focus:ring-green-300"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-green-500 focus:ring focus:ring-green-300"
          />
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-green-500 focus:ring focus:ring-green-300"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-md bg-[#006C36] px-4 py-2 text-white font-medium shadow hover:bg-[#006C36]/80 focus:outline-none focus:ring focus:ring-blue-200 disabled:opacity-70"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Account
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <button className="text-[#006C36] font-medium hover:underline" onClick={onSwitch}>
          Sign In
        </button>
      </div>
    </div>
  );
}

export default SignupForm;
