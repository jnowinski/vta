import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">Welcome to the VTA!</h1>
      <div className="flex gap-4">
        <button
          className="px-6 py-3 rounded text-white font-semibold hover:brightness-110"
          style={{ backgroundColor: '#861F41' }} // Maroon
          onClick={() => navigate('/signin')}
        >
          Sign In
        </button>
        <button
          className="px-6 py-3 rounded text-white font-semibold hover:brightness-110"
          style={{ backgroundColor: '#E5751F' }} // Orange
          onClick={() => navigate('/signup')}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}

export default App;