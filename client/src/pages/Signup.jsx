import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const Signup = () => {
  const { signupWithEmail } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signupWithEmail(name, email, password);
    } catch (err) {
      setError(err?.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-semibold mb-4">Create account</h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border p-2 rounded" type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="w-full border p-2 rounded" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full border p-2 rounded" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button disabled={loading} className="w-full bg-black text-white p-2 rounded" type="submit">{loading ? 'Creating...' : 'Create account'}</button>
      </form>
    </div>
  );
};

export default Signup;

