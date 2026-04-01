import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import MedicineList from './MedicineList';

const Home = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/auth/me', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (err) {
        // Not logged in
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      toast.success('Logged out successfully');
      setUser(null);
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  if (user) {
    // Logged in home
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-md p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">Medicine Supply</h1>
            <div className="flex items-center space-x-4">
              <Link to="/cart" className="text-gray-700 hover:text-blue-600">Cart</Link>
              <Link to="/orders" className="text-gray-700 hover:text-blue-600">Orders</Link>
              <span className="text-gray-700">Welcome, {user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
        <div className="container mx-auto p-4">
          <MedicineList />
        </div>
      </div>
    );
  }

  // Landing page
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex flex-col items-center justify-center">
      <div className="absolute top-4 right-4">
        <Link
          to="/admin/login"
          className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition text-sm"
        >
          Admin Portal
        </Link>
      </div>
      <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-4">Medicine Supply System</h1>
        <p className="text-xl mb-8">Manage your medical supplies efficiently</p>
        <div className="space-x-4">
          <Link
            to="/signup"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Sign Up
          </Link>
          <Link
            to="/login"
            className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;