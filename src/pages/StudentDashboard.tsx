import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/')
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-4">Student Dashboard</h1>
            <button
                onClick={handleSignOut}
                className="px-6 py-3 rounded text-white font-semibold mt-4 hover:brightness-110"
                style={{ backgroundColor: '#861F41' }}
            >
                Sign Out
            </button>
        </div>
    );
};

export default StudentDashboard;
