
import {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    error: string | null;
    signIn: (email: string, password: string) => Promise<{ session: Session | null, error: Error | null}>;
    signUp: (email: string, password: string, firstName: string, lastName: string, Username: string) => Promise<{ user: User | null, error: Error | null }>;
    signOut: () => Promise<Error | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Listen for auth changes
    useEffect(() => {
        let isMounted = true;
        let pollInterval: NodeJS.Timeout;

        const init = async () => {
            const { data, error } = await supabase.auth.getSession();
            const currentSession = data.session ?? null;
            if (!isMounted) return;

            setError(error?.message ?? null);
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            setLoading(false);

            // Poll until valid session is found
            if (!currentSession) {
                pollInterval = setInterval(async () => {
                const { data } = await supabase.auth.getSession();
                const newSession = data.session ?? null;
                if (newSession) {
                    console.log('Session detected via polling');
                    setSession(newSession);
                    setUser(newSession.user);
                    clearInterval(pollInterval);
                }
                }, 2000); // Poll every 2 seconds
            }
        };

        init();

        //Refresh session and user on auth state change (sign in, sign out, etc.)
        const { data: listener } = supabase.auth.onAuthStateChange(
            async (_, session) => {
                console.log('Auth state changed:', session);
                setSession(session);
                setUser(session?.user ?? null);
            }
        );

        return () => {
            listener.subscription.unsubscribe();
            isMounted = false;
            if (pollInterval) {
                clearInterval(pollInterval);
            }
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        setError(error?.message ?? null);
        setLoading(false);
        if (error) throw error;
        return {session: data.session, error};
    };

    const signUp = async (email: string, password: string, firstName: string, lastName: string, username: string) => {
        setLoading(true);
        //Supabase signup (CHANGE REDIRECT URL TO DOMAIN NAME FOR PRODUCTION)
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
            data: {
                first_name: firstName,
                last_name: lastName,
                username: username,
            },
            emailRedirectTo: 'http://localhost:5173/confirmation'},
        });
        setError(error?.message ?? null);
        setLoading(false);
        return { user: data.user, error };
    };

    const signOut = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signOut();
        setLoading(false);
        if (error) {
            setError(error.message);
            throw error;
        } else {
            setError(null);
            setUser(null);
            setSession(null);
        }
        return error;
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, error, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
