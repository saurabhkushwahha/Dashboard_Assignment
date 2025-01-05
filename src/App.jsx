import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { AuthService } from './firebase/services/auth.service';
import Login from './components/auth/Login/Login';
import SignUp from './components/auth/SignUp/SignUp';
import Dashboard from './components/dashboard/Dashboard';
import AnimationWrapper from './components/shared/AnimationWrapper';
import { NewsProvider } from './context/NewContext';
function App() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [isAuthenticated]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <NewsProvider>
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <AnimationWrapper>
                <Login />
              </AnimationWrapper>
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
        <Route
          path="/signup"
          element={
            !isAuthenticated ? (
              <AnimationWrapper>
                <SignUp />
              </AnimationWrapper>
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />

        {/* Protected Route */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <AnimationWrapper>
                <Dashboard />
              </AnimationWrapper>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Redirect root to login */}
        <Route
          path="/"
          element={<Navigate to="/login" />}
        />
      </Routes>
    </AnimatePresence>
    </NewsProvider>
  );
}

export default App;
