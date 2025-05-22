import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardRoute } from '../utils/routeHelpers';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';

const AcceptInvite = () => {
    const navigate = useNavigate();
    const { createUserProfile } = useUser();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Parse PKCE hash params
    const parseHashParams = () => {
        const hash = window.location.hash.substring(1); // Remove #
        const params = new URLSearchParams(hash);
        return {
            access_token: params.get('access_token'),
            refresh_token: params.get('refresh_token'),
            type: params.get('type'),
            error: params.get('error'),
            code: params.get('code'),
            expires_in: params.get('expires_in'),
        };
    };

    // verify that invite token is present
    useEffect(() => {
        const { access_token, type } = parseHashParams();
        if (!access_token || type !== 'invite') {
            setError('Invalid or missing invite link.');
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { access_token } = parseHashParams();
            if (!access_token) throw new Error('Missing access token.');

            const hashParams = new URLSearchParams(window.location.hash.slice(1));
            const authCode = hashParams.get('code');
            if (!authCode) throw new Error('Missing auth code.');
            // Get session from code in url
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(authCode);
            if (exchangeError) throw exchangeError;

            const user = data.session.user;
            if (!user) throw new Error('User session not found.');

            // update auth user metadata and password
            const { error: authUpdateError } = await supabase.auth.updateUser({
                password,
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    username: username,
                },
            });
            if (authUpdateError) throw authUpdateError;

            // Create user profile in the database
            const { userProfile, error } = await createUserProfile(user);
            if (error) throw error;

            // Redirect to dashboard or home page
            if (!userProfile) throw new Error('User profile creation failed.');
            navigate(getDashboardRoute(userProfile?.role));
        } catch (err: any) {
            setError(err.message || 'Error accepting invite.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
            <h2>Accept Invite</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <label>
                    First Name<br />
                    <input
                        type="text"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        required
                    />
                </label><br />
                <label>
                    Last Name<br />
                    <input
                        type="text"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        required
                    />
                </label><br />
                <label>
                    Username<br />
                    <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                    />
                </label><br />
                <label>
                    Password<br />
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                </label><br />
                <button type="submit" disabled={loading}>
                    {loading ? 'Processing...' : 'Accept Invite'}
                </button>
            </form>
        </div>
    );
};

export default AcceptInvite;
