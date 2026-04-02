import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalMedicines: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const medicinesRes = await fetch('https://medicine-supply.onrender.com/api/medicines');
      const medicines = await medicinesRes.json();

      const ordersRes = await fetch('https://medicine-supply.onrender.com/api/orders/admin/all', {
        credentials: 'include',
      });
      const orders = await ordersRes.json();

      const pendingCount = orders.filter(o => o.status === 'Pending').length;

      setStats({
        totalMedicines: medicines.length,
        totalOrders: orders.length,
        pendingOrders: pendingCount,
      });
    } catch (err) {
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md p-4 mb-8">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Pharmacy Admin</h1>
          <div className="space-x-4">
            <Link to="/admin/medicines" className="text-gray-700 hover:text-blue-600 font-semibold">Medicines</Link>
            <Link to="/admin/orders" className="text-gray-700 hover:text-blue-600 font-semibold">Orders</Link>
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-semibold">Logout</Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-4">
        <h2 className="text-3xl font-bold mb-8">Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">Total Medicines</h3>
            <p className="text-4xl font-bold text-blue-600 mt-2">{stats.totalMedicines}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">Total Orders</h3>
            <p className="text-4xl font-bold text-green-600 mt-2">{stats.totalOrders}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-600">Pending Orders</h3>
            <p className="text-4xl font-bold text-yellow-600 mt-2">{stats.pendingOrders}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/admin/medicines"
            className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            <h3 className="text-xl font-semibold mb-2">Manage Medicines</h3>
            <p>Add, edit, or remove medicines from inventory</p>
          </Link>
          <Link
            to="/admin/orders"
            className="bg-green-600 text-white p-6 rounded-lg shadow-md hover:bg-green-700 transition"
          >
            <h3 className="text-xl font-semibold mb-2">Manage Orders</h3>
            <p>View and update order status</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;