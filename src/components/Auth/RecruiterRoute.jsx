import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

export default function RecruiterRoute() {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== 'recruiter') return <Navigate to="/" replace />;
  return <Outlet />;
}
