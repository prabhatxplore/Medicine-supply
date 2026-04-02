import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('https://medicine-supply.onrender.com/api/auth/me', {
          credentials: 'include', // to send cookies
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          navigate('/login');
        }
      } catch (err) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch('https://medicine-supply.onrender.com/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Medicine Supply Dashboard</h1>
        {user && (
          <div className="mb-4">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Status:</strong> {user.status}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;