import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import { getDashboardRoute } from '../utils/routeHelpers';
import type { FormEvent } from 'react';
const Signin: React.FC = () => {
    const { session, signIn } = useAuth();
    const { fetchUserProfile } = useUser();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

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

        if (!email || !password) {
            setError('Email and password are required.');
            return;
        }

        console.log('Submitted', { email, password });

        setError(null);

        try {
            const { session, error } = await signIn(email, password);
            if (error) throw error;
            else if (session) {
                // Redirect to the appropriate dashboard based on user role
                const {userProfile, error} = await fetchUserProfile(session.user.id);
                if (error) throw new Error('Error fetching user profile')
                if (!userProfile) throw new Error('User profile not found. Please sign up and confirm email.');
                else {
                    navigate(getDashboardRoute(userProfile?.role));
                    return;
                }
            }
        }
        catch (err: any) {
            console.error('Error signing in:', err);
            setError(err.message || 'Error signing in.');
        }
    };

    return (
        <div>
            <form className="max-w-md m-auto pt-24" onSubmit={handleSubmit}>
                <h2 className="font-bold pb-2">Sign up!</h2>
                <p>Sign in with email and password.</p>
                <div className="flex flex-col py-4">
                    <input placeholder="Email" className="p-3 mt-6 bg-gray700" type="email" id="email" name="email" required />
                    <input placeholder="Password" className="p-3 mt-6" type="password" id="password" name="password" required />
                    {error && (<p className="text-red-500 mt-2">{error}</p>)}
                    <button className="mt-6 w-full" type="submit">Sign In</button>
                </div>
                <p>Dont have an account? <Link to="/signup">Sign in!</Link></p>
            </form>
        </div>
    );
};

export default Signin;
