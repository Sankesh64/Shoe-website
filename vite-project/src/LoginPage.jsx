import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from './context/AppContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-20 flex justify-center items-center min-h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass w-full max-w-md rounded-3xl p-10 shadow-2xl"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-[rgba(241,241,238,0.6)]">Sign in to your premium RoeBook account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest opacity-50 font-bold px-1">Email Address</label>
            <input 
              required
              type="email"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-[var(--accent)] transition-all"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest opacity-50 font-bold px-1">Password</label>
            <input 
              required
              type="password"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-[var(--accent)] transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full py-4 rounded-2xl bg-white text-black font-bold text-lg hover:bg-[var(--accent)] hover:text-white transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:transform-none"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-10 pt-10 border-t border-white/5 text-center text-sm">
          <p className="opacity-50">Don't have an account?</p>
          <Link to="/register" className="mt-2 inline-block font-bold text-[var(--accent)] hover:underline">Create a new account</Link>
        </div>
        
        <div className="mt-8 flex justify-center gap-4 text-xs opacity-30">
          <p>Privacy Policy</p>
          <span>•</span>
          <p>Terms of Service</p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
