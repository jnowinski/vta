import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardRoute } from '../utils/routeHelpers';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';

const ConfirmEmail: React.FC = () => {
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const { userProfile, createUserProfile } = useUser();
  const [message, setMessage] = useState('');
  const [showDashboardLink, setShowDashboardLink] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!session) {
        console.log('No session yet, waiting for email confirmation');
        setMessage('Confirmation email sent. Please check your inbox and click the link to continue.');
        return;
      }

      if (session.user?.confirmed_at) {
        if (userProfile) {
          setMessage('Email confirmed!');
          setShowDashboardLink(true);
        } else {
          setMessage('Email confirmed, but user profile not found.');
        }
      }
    };

    init();
  }, [session, userProfile]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>{message}</p>
      {showDashboardLink && userProfile && (
        <p>
          <a href={getDashboardRoute(userProfile.role)}>Click here to go to your dashboard.</a>
        </p>
      )}
    </div>
  );
};

export default ConfirmEmail;
