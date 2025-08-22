import React, {useState} from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth';
import {auth} from '../firebaseConfig.js';
import { useAuth } from '../contexts/AuthContexts.jsx';
import { AlertCircle, Info, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const {currentUser} = useAuth();

  const  handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError('Failed to log in' + error.message);
    }
    setLoading(false);
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white shadow-md">

        <div className="border-b p-6 text-center">
           <h2 className="text-2xl font-serif font-semibold text-gray-900">Welcome Back</h2>
          <p className="text-sm text-gray-500">Sign in to your Ethio Farmers account</p>
        </div>

        <div className="p-6">
          {/* Demo Mode Alert */}
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-[#006C36]">
            <Info className="h-4 w-4 mt-0.5" />
            <p>
              <span className="font-medium">Demo Mode:</span> Use any email/password to sign in. Try{" "}
              <span className="ml-1">"farmer@demo.com"</span> or <span>"buyer@demo.com"</span>
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-[#006C36] focus:ring focus:ring-blue-200"
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
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-[#006C36] focus:ring focus:ring-green-300"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-[#006C36] px-4 py-2 text-white font-medium shadow hover:opacity-70 focus:outline-none focus:ring focus:ring-green-300 disabled:opacity-70"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign In
            </button>
          </form>

          <div className='mt-4 text-center'>
            <p className="text-sm text-gray-500">Don't have an account?{" "}
                <a href="/register" className="font-medium text-[#006C36] hover:underline">Sign Up</a>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Login;
