import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // or your user context
import { useUser } from '../context/UserContext';
interface RequireAuthProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ allowedRoles, children }) => {
  const { user, session } = useAuth(); // get current user/auth state
  const { userProfile, loadingProfile } = useUser(); //get custom user profile
  const location = useLocation();

  if (!user && !session) {
    // Not logged in or no valid session, redirect to signin.
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  if (loadingProfile) return <div>Loading...</div>;
  if (!userProfile || !allowedRoles.includes(userProfile?.role)) {
    // Logged in but no permission
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
