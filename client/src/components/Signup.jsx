import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    phoneNumber: '',
    nationalIdCard: null,
    citizenshipCard: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        data.append(key, formData[key]);
      }
    });

    try {
      const response = await fetch('https://medicine-supply.onrender.com/api/auth/signup', {
        method: 'POST',
        body: data,
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        // Backend sets session on signup, so redirect user immediately.
        toast.success('Signup successful! Redirecting…');
        navigate('/');
      } else {
        toast.error(result.message || 'Signup failed');
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
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            name="name"
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
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
          <input
            name="address"
            type="text"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            name="phoneNumber"
            type="tel"
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700">National ID Card</label>
            <input
              name="nationalIdCard"
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Citizenship Card</label>
            <input
              name="citizenshipCard"
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center">
          Already have an account? <a href="/login" className="text-blue-600">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;