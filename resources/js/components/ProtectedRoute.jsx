import { Navigate } from 'react-router-dom';
import { useAuth } from "../../src/contexts/AuthContext";      // ✅ from components/ to src/

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
}