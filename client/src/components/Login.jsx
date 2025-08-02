import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { useUser } from '../context/UserContext';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';


const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useUser();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const navigate = useNavigate();

  useEffect(() => {
    // Add auth-page class to root element
    document.getElementById('root').classList.add('auth-page');
    
    // Cleanup function to remove the class when component unmounts
    return () => {
      document.getElementById('root').classList.remove('auth-page');
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      // Sign in with Firebase Auth
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      // Redirect based on email
      if (formData.email === 'admin@health.com') {
        navigate('/admin', { replace: true });
      } else {
      navigate(from, { replace: true });
      }
    } catch (error) {
      setErrors({ general: error.message || 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="auth-card">
        <div className="text-center mb-8">
          <h2>Sign in to <span className="text-primary">Smart Health</span></h2>
          <p className="mt-2">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-primary hover:text-primary-dark underline"
            >
              create a new account
            </Link>
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div className="alert alert-error animate-shake">{errors.general}</div>
          )}
          <div className="input-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-error font-semibold animate-shake">{errors.email}</p>
            )}
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-error font-semibold animate-shake">{errors.password}</p>
            )}
          </div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
              />
              <label htmlFor="remember-me" className="ml-2">Remember me</label>
            </div>
            <a href="#" className="font-medium text-primary hover:text-primary-dark underline">
              Forgot your password?
            </a>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;