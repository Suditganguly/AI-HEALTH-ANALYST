import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const AuthRedirect = () => {
  const { isAuthenticated, authChecked } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (authChecked) {
      if (isAuthenticated) {
        // User is authenticated, redirect to dashboard or intended page
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        // User is not authenticated, redirect to register
        navigate('/register', { replace: true });
      }
    }
  }, [isAuthenticated, authChecked, navigate, location]);

  return null; // This component doesn't render anything
};

export default AuthRedirect; 