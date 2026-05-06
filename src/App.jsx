import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AccountPage from './pages/AccountPage';
import TutorPage from './pages/TutorPage';
import RewardsPage from './pages/RewardsPage';
import PricingPage from './pages/PricingPage';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/account" element={
        <ProtectedRoute><AccountPage /></ProtectedRoute>
      } />
      <Route path="/tutor" element={
        <ProtectedRoute><TutorPage /></ProtectedRoute>
      } />
      <Route path="/rewards" element={
        <ProtectedRoute><RewardsPage /></ProtectedRoute>
      } />
      <Route path="/pricing" element={
        <ProtectedRoute><PricingPage /></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
