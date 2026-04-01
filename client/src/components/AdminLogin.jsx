import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // For demo, we'll use regular login but check for admin credentials
    // In production, you'd have an admin table and role-based access
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      if (response.ok) {
        // For now, direct to admin dashboard
        // In production, check user role
        toast.success('Admin login successful!');
        navigate('/admin');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Admin Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            name="email"
            type="email"
            placeholder="Admin Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Demo: Use any registered user account to access admin panel
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;