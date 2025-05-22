import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDashboardRoute } from '../utils/routeHelpers';
import type { FormEvent } from 'react';
import zxcvbn from 'zxcvbn';

const Signup: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const { session, signUp } = useAuth();
  const { fetchUserProfile } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectIfLoggedIn = async () => {
      if (session?.user) {
        try {
          const { userProfile, error } = await fetchUserProfile(session.user.id);
          if (error) throw new Error('Error fetching user profile');
          if (userProfile) {
            navigate(getDashboardRoute(userProfile.role));
          }
        } catch (err: any) {
          console.error('Redirect error:', err);
          setError('Failed to redirect to dashboard.');
        }
      }
    };
    redirectIfLoggedIn();
  }, [session, fetchUserProfile, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('first-name') as string;
    const lastName = formData.get('last-name') as string;
    const username = formData.get('username') as string;
    const confirmPassword = formData.get('confirm-password') as string;

    if (password !== confirmPassword) {
      setError('Passwords must match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return;
    }

    const result = zxcvbn(password);
    if (result.score < 3) {
      setError('Password is too weak. Please include digits, lowercase, uppercase, and special characters.');
      return;
    }

    try {
      //Authenticate new user with supabase
      const { error } = await signUp(email, password, firstName, lastName, username);

      if (error) {
        if (error.message.includes('User already registered')) {
            throw new Error('Email already registered. Please sign in.');
          }
        else {
          throw new Error(error.message);
        }
      }
      //Redirect to confirm email page
      navigate('/confirm-email');
    } catch (err: any) {
      setError(err.message || 'Error signing up.');
    }
    return;
  };

  return (
    <div>
      <form className="max-w-md m-auto pt-24" onSubmit={handleSubmit}>
        <h2 className="font-bold pb-2">Sign up!</h2>
        <p>
          Create an account to access the Virtual GTA. Please provide a valid email address and a strong password.
        </p>
        <div className="flex flex-col py-4">
          <input placeholder="First" className="p-3 mt-6 bg-gray700" type="string" id="first-name" name="first-name" />
          <input placeholder="Last" className="p-3 mt-6 bg-gray700" type="string" id="last-name" name="last-name" />
          <input placeholder="Username" className="p-3 mt-6 bg-gray700" type="string" id="username" name="username" required />
          <input placeholder="Email" className="p-3 mt-6 bg-gray700" type="email" id="email" name="email" required />
          <input placeholder="Password" className="p-3 mt-6" type="password" id="password" name="password" required />
          <input placeholder="Confirm Password" className="p-3 mt-6" type="password" id="confirm-password" name="confirm-password" required />
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <button className="mt-6 w-full" type="submit">Sign Up</button>
        </div>
        <p>
          Already have an account? <Link to="/signin">Sign in!</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
