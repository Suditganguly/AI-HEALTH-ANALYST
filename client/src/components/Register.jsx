import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaVenusMars, FaPhone, FaBirthdayCake } from 'react-icons/fa';
import { useUser } from '../context/UserContext';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { loginUser } = useUser();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.age) newErrors.age = 'Age is required';
    else if (formData.age < 1 || formData.age > 120) newErrors.age = 'Please enter a valid age';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) newErrors.phone = 'Please enter a valid phone number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      loginUser({ profile: { email: formData.email, name: formData.name } });
      navigate('/login');
    } catch (error) {
      setErrors({ general: error.message || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page register-container">
      <div className="auth-bg-blur"></div>
      <div className="auth-card">
        <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
          <Link
            to="/"
            style={{
              color: '#2563eb',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '1rem',
              display: 'inline-block',
              transition: 'text-decoration 0.2s',
            }}
            className="back-to-home-link"
          >
            <span style={{ fontSize: '1.1em', marginRight: '0.4em', verticalAlign: 'middle' }}>←</span> Back to Home
          </Link>
        </div>
        <div className="text-center mb-8">
          <div className="mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-primary shadow-neumorph text-white text-3xl font-bold mb-4 backdrop-blur-md">
            <span role="img" aria-label="register">📝</span>
          </div>
          <h2>Create your <span className="text-primary">Smart Health</span> account</h2>
          <p className="mt-2">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark underline">Sign in</Link>
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {errors.general && <div className="alert alert-error animate-shake">{errors.general}</div>}
          <div className="space-y-4">
            <div className="relative">
              <label htmlFor="name">Full Name</label>
              <span className="absolute left-3 top-9 text-neutral-400"><FaUser /></span>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                className={`input input-dark w-full pl-10 ${errors.name ? 'border-error ring-error' : ''}`}
                placeholder="Enter your full name"
                aria-invalid={!!errors.name}
                aria-describedby="name-error"
              />
              {errors.name && (
                <p id="name-error" className="mt-1 text-sm text-error font-semibold animate-shake">{errors.name}</p>
              )}
            </div>
            <div className="relative">
              <label htmlFor="email">Email address</label>
              <span className="absolute left-3 top-9 text-neutral-400"><FaEnvelope /></span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`input input-dark w-full pl-10 ${errors.email ? 'border-error ring-error' : ''}`}
                placeholder="Enter your email"
                aria-invalid={!!errors.email}
                aria-describedby="email-error"
              />
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-error font-semibold animate-shake">{errors.email}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label htmlFor="age">Age</label>
                <span className="absolute left-3 top-9 text-neutral-400"><FaBirthdayCake /></span>
                <input
                  id="age"
                  name="age"
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={handleChange}
                  className={`input input-dark w-full pl-10 ${errors.age ? 'border-error ring-error' : ''}`}
                  placeholder="Age"
                  aria-invalid={!!errors.age}
                  aria-describedby="age-error"
                />
                {errors.age && (
                  <p id="age-error" className="mt-1 text-sm text-error font-semibold animate-shake">{errors.age}</p>
                )}
              </div>
              <div className="relative">
                <label htmlFor="gender">Gender</label>
                <span className="absolute left-3 top-9 text-neutral-400"><FaVenusMars /></span>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`input input-dark w-full pl-10 ${errors.gender ? 'border-error ring-error' : ''}`}
                  aria-invalid={!!errors.gender}
                  aria-describedby="gender-error"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p id="gender-error" className="mt-1 text-sm text-error font-semibold animate-shake">{errors.gender}</p>
                )}
              </div>
            </div>
            <div className="relative">
              <label htmlFor="phone">Phone Number</label>
              <span className="absolute left-3 top-9 text-neutral-400"><FaPhone /></span>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                className={`input input-dark w-full pl-10 ${errors.phone ? 'border-error ring-error' : ''}`}
                placeholder="Enter your phone number"
                aria-invalid={!!errors.phone}
                aria-describedby="phone-error"
              />
              {errors.phone && (
                <p id="phone-error" className="mt-1 text-sm text-error font-semibold animate-shake">{errors.phone}</p>
              )}
            </div>
            <div className="relative">
              <label htmlFor="password">Password</label>
              <span className="absolute left-3 top-9 text-neutral-400"><FaLock /></span>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                className={`input input-dark w-full pl-10 ${errors.password ? 'border-error ring-error' : ''}`}
                placeholder="Create a password"
                aria-invalid={!!errors.password}
                aria-describedby="password-error"
              />
              {errors.password && (
                <p id="password-error" className="mt-1 text-sm text-error font-semibold animate-shake">{errors.password}</p>
              )}
            </div>
            <div className="relative">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <span className="absolute left-3 top-9 text-neutral-400"><FaLock /></span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`input input-dark w-full pl-10 ${errors.confirmPassword ? 'border-error ring-error' : ''}`}
                placeholder="Confirm your password"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby="confirmPassword-error"
              />
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="mt-1 text-sm text-error font-semibold animate-shake">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
          <div className="flex items-center mb-2">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded shadow-neumorph-sm"
            />
            <label htmlFor="terms" className="ml-2">
              I agree to the{' '}
              <a href="#" className="text-primary hover:text-primary-dark underline">Terms and Conditions</a> and{' '}
              <a href="#" className="text-primary hover:text-primary-dark underline">Privacy Policy</a>
            </label>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full"
            style={{ minHeight: 48 }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating account...
              </div>
            ) : (
              'Create account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;