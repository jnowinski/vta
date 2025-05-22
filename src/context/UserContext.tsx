// src/context/UserContext.tsx
//Context for managing user profiles and user roles

import {
  createContext,
  useState,
  useContext,
  useEffect
} from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';
type Role = 'admin' | 'student' | 'guest';
type UserStatus = 'unverified' | 'active' | 'banned';

export type UserProfile = {
  id: string;
  email: string;
  username: string;
  role: Role;
  first_name: string;
  last_name: string;
  status: UserStatus,
  token_count: number;
  created_at: string;
  updated_at: string;
};

interface UserContextType {
  userProfile: UserProfile | null;
  loadingProfile: boolean;
  error: string | null;
  createUserProfile: (user: User) => Promise<{userProfile: UserProfile | null, error: Error | null}>
  fetchUserProfile: (userId: string) => Promise<{userProfile: UserProfile | null, error: Error | null}>
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<{userProfile: UserProfile | null, error: Error | null}>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  //Listen for session changes and fetch user

  useEffect(() => {
    if (!session?.user?.id){
      setUserProfile(null);
      return;
    }
    //Listen for changes to the user profile
    const channel = supabase
      .channel('public:users')
      .on(
        'postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${session.user.id}` },
        (payload) => {
          console.log('User profile updated:', payload.new);
          setUserProfile(payload.new as UserProfile);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);


  const createUserProfile = async (user: User): Promise<{ userProfile: UserProfile | null, error: Error | null }> => {
    if (!user.user_metadata) {
      setError('Profile creation failed. No user metadata found');
      return { userProfile: null, error: new Error('No user metadata found') };
    }
    setLoadingProfile(true);
    setError(null);

    try {
      const { data, error } = await supabase.from('users').insert([
        {
          id: user.id,
          email: user.email,
          username: user.user_metadata.username,
          first_name: user.user_metadata.first_name,
          last_name: user.user_metadata.last_name,
        },
      ]).select().single();

      if (error) {
        setError(error.message);
        return { userProfile: null, error };
      }

      setUserProfile(data as UserProfile); //set the newly created user profile in state
      return { userProfile: data as UserProfile ?? null, error: null };
    } catch (err: any) {
      setError(err.message || 'Unknown error creating user profile');
      return { userProfile: null, error: err };
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchUserProfile = async (userId: string): Promise<{ userProfile: UserProfile | null, error: Error | null }> => {
    setLoadingProfile(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        const errMsg = error?.message || 'No user profile found';
        setError(errMsg);
        return { userProfile: null, error: new Error(errMsg) };
      }

      setUserProfile(data as UserProfile);

      return { userProfile: data as UserProfile, error: null };

    } catch (err: any) {
      setError(err.message || 'Unknown error fetching user profile');
      return { userProfile: null, error: err };
    } finally {
      setLoadingProfile(false);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<{ userProfile: UserProfile | null, error: Error | null }> => {
    if (!userProfile) {
      const errMsg = 'No user profile loaded to update';
      setError(errMsg);
      return { userProfile: null, error: new Error(errMsg) };
    }

    setLoadingProfile(true);
    setError(null);
    try {
      const updatesWithTimestamp = {
        ...updates,
        updated_at: new Date().toISOString(), // timestampz format
      };

      const { error } = await supabase
        .from('users')
        .update(updatesWithTimestamp)
        .eq('id', userProfile.id);

      if (error) {
        setError(error.message);
        return { userProfile: null, error };
      }

      // refetch the updated profile:
      const { userProfile: updatedProfile, error: fetchError } = await fetchUserProfile(userProfile.id);
      return { userProfile: updatedProfile, error: fetchError };
    } catch (err: any) {
      setError(err.message || 'Unknown error updating user profile');
      return { userProfile: null, error: err };
    } finally {
      setLoadingProfile(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        userProfile,
        loadingProfile,
        error,
        createUserProfile,
        fetchUserProfile,
        updateUserProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};
