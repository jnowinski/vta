import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardRoute } from '../utils/routeHelpers';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';

const Confirmation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userProfile, createUserProfile } = useUser();
  const [message, setMessage] = useState('Email confirmed');

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      console.log('No user signed in. Please sign in to continue.');
      return;
    }

    //Ideally, this should not happen. User should be redirected to the confirmation page after clicking confirmation link.
    //If this throws probably something wrong with the acceses tokens appended to confirmation link.
    if (!user.confirmed_at) {
      setMessage('Your email is not confirmed yet. Please check your inbox.');
      console.log('Email not confirmed.');
      return;
    }

    console.log('User:', user);
    const setupProfileAndRedirect = async () => {
        if (userProfile) {
            navigate(getDashboardRoute(userProfile.role));
            return;
        }

        try {
            const {userProfile, error} = await createUserProfile(user);
            if (error) throw new Error('Error creating user profile: ' + error.message);
    
            if (userProfile) {
                setMessage('Navigating')
                navigate(getDashboardRoute(userProfile.role));
            } else {
                setMessage('Failed to create profile. Please try signing up again.');
            }
        } 
        catch (error: any) {
            setMessage('Error creating profile: ' + error.message);
        }
    };

    setupProfileAndRedirect();
  }, [user, userProfile, createUserProfile, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-semibold">{message}</h1>
    </div>
  );
};

export default Confirmation;