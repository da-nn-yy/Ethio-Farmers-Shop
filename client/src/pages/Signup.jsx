import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import axios from "axios";
import { Info, Loader2, User, Tractor, AlertCircle } from "lucide-react";


const Signup = () => {
  const [role, setRole] = useState("buyer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isDemoMode = true; // Set to false if not demo

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if(password !== confirmPassword) {
      return setError("Passwords do not match");
    }
    setLoading(true);
    try{
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const token = await user.getIdToken();

        await axios.post('http://localhost:5000/api/register', {
          email,
          role,
          name,
          phone,
          location,
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        window.location.href = '/login';
    } catch (error) {
        setError("Failed to create an account: " + error.message);
    }
    setLoading(false);
  };

  const onToggleMode = () => {
    window.location.href = '/login';
  }
  return (
    <div className="min-h-screeen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border bg-white shadow-md mx-auto my-12">
        <div className="border-b p-6 text-center">
          <h2 className="text-2xl font-serif font-semibold text-gray-900">Join Ethio Farmers</h2>
          <p className="text-sm text-gray-500">Create your account to get started</p>
        </div>

           <div className="p-6 space-y-4">
          {/* Demo Mode Alert */}
          {isDemoMode && (
            <div className="flex items-start gap-2 rounded-lg border border-green-300 bg-blue-50 p-3 text-sm text-[#006C36]">
              <Info className="h-4 w-4 mt-0.5" />
              <p>
                Demo Mode: Create an account with any details. Include "farmer" in email for farmer role.
              </p>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">I am a:</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="buyer"
                    checked={role === "buyer"}
                    onChange={() => setRole("buyer")}
                    className="accent-blue-600"
                  />
                  <User className="w-4 h-4" />
                  Buyer
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="farmer"
                    checked={role === "farmer"}
                    onChange={() => setRole("farmer")}
                    className="accent-blue-600"
                  />
                  <Tractor className="w-4 h-4" />
                  Farmer
                </label>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isDemoMode ? "Try farmer@demo.com or buyer@demo.com" : "Enter your email"}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number (Optional)
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location (Optional)
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Region"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isDemoMode ? "Any password (min 6 chars)" : "Create a password"}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white font-medium shadow hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-200 disabled:opacity-70"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Account
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <button type="button" onClick={onToggleMode} className="font-medium text-blue-600 hover:underline">
                Sign in
              </button>
            </p>
          </div>

        </div>

    </div>
  )
}

export default Signup
