import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    phoneNumber: '',
    nationalIdCard: null,
    citizenshipCard: null,
  });
  const [fileNames, setFileNames] = useState({
    nationalIdCard: '',
    citizenshipCard: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
      setFileNames({ ...fileNames, [name]: files[0].name });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        data.append(key, formData[key]);
      }
    });

    try {
      const response = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Account created! Awaiting verification.');
        navigate('/login');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 md:py-12 px-4">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">💊</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">PharmaCare</span>
          </Link>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-2">Create Account</h2>
          <p className="text-center text-gray-600 text-sm mb-8">Join PharmaCare for fast medicine delivery</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password * (min 6 chars)</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                name="phoneNumber"
                type="tel"
                placeholder="+977-98xxxxxxxx"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                name="address"
                type="text"
                placeholder="Street address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-base"
              />
            </div>

            <div className="border-t pt-4 mt-4">
              <p className="text-sm font-medium text-gray-700 mb-4">Identity Verification (Required)</p>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    National ID Card *
                  </label>
                  <div className="relative">
                    <input
                      name="nationalIdCard"
                      type="file"
                      accept="image/jpeg"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file && file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
                          toast.error('Please upload a JPG image');
                          e.target.value = '';
                          return;
                        }
                        handleChange(e);
                      }}
                      className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  {fileNames.nationalIdCard && (
                    <p className="text-xs text-green-600 mt-1">✓ {fileNames.nationalIdCard}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Citizenship Card *
                  </label>
                  <div className="relative">
                    <input
                      name="citizenshipCard"
                      type="file"
                      accept="image/jpeg"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file && file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
                          toast.error('Please upload a JPG image');
                          e.target.value = '';
                          return;
                        }
                        handleChange(e);
                      }}
                      className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  {fileNames.citizenshipCard && (
                    <p className="text-xs text-green-600 mt-1">✓ {fileNames.citizenshipCard}</p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-bold text-base md:text-lg mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">⏳</span>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700">
                Sign in
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

export default SignupPage;
