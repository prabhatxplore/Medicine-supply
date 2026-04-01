import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const LoginPage = () => {
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

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Login successful!');
        navigate('/');
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-teal-600 py-8 md:py-12 px-4 flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-sm mx-auto w-full relative z-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-emerald-600 font-bold text-2xl">💊</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-white">PharmaCare</span>
              <p className="text-white/80 text-xs">Your Health, Our Priority</p>
            </div>
          </Link>
        </div>

        {/* Form Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-8 border border-white/30">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-center text-gray-600 text-sm mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-base"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-lg hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition font-bold text-lg mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">⏳</span>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 font-bold hover:text-blue-700">
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Help Link */}
        <p className="text-center text-gray-600 text-xs md:text-sm mt-6">
          <Link to="/" className="hover:text-blue-600 font-medium">
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
};


export default LoginPage;