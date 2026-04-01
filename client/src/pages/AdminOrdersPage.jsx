import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      toast.success('Logged out successfully');
      navigate('/');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/orders/admin/all', {
        credentials: 'include',
      });
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3000/api/orders/${orderId}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success('Order status updated');
        fetchOrders();
      } else {
        toast.error('Failed to update status');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const handleViewPrescription = (prescriptionPath) => {
    if (!prescriptionPath) {
      toast.error('No prescription available for this order');
      return;
    }
    window.open(`http://localhost:3000/${prescriptionPath}`, '_blank');
  };

  const filteredOrders = filter === 'All' 
    ? orders 
    : orders.filter(o => o.status === filter);

  const requiresPrescription = (order) => order.items.some(item => item.medicine?.requiresPrescription);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin text-4xl">⏳</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md p-4 mb-8 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">🏥 Pharmacy Admin</h1>
          <div className="space-x-4">
            <a href="/admin" className="text-gray-700 hover:text-blue-600 font-semibold">Dashboard</a>
            <a href="/admin/medicines" className="text-gray-700 hover:text-blue-600 font-semibold">Medicines</a>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Manage Orders</h2>
          <p className="text-gray-600">Review and manage customer orders</p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-8 flex flex-wrap gap-2">
          {['All', 'Pending', 'Processed', 'Delivered'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded font-medium transition ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-600'
              }`}
            >
              {status} ({orders.filter(o => status === 'All' ? true : o.status === status).length})
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              {/* Order Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Order ID</p>
                    <p className="font-bold text-lg text-gray-900">{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Customer</p>
                    <p className="font-semibold text-gray-900">{order.user?.email || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Total</p>
                    <p className="font-bold text-lg text-green-600">${order.totalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Date</p>
                    <p className="font-semibold text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Status</p>
                    <span className={`inline-block px-3 py-1 rounded text-sm font-bold ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Processed' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="p-6 border-b bg-gray-50">
                <h4 className="font-bold text-gray-900 mb-3">📦 Items</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-white rounded border">
                      <div>
                        <p className="font-semibold text-gray-900">{item.medicine?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} × ${item.price.toFixed(2)}
                          {item.medicine?.requiresPrescription && (
                            <span className="ml-2 inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                              Rx Required
                            </span>
                          )}
                        </p>
                      </div>
                      <span className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prescription Section */}
              {requiresPrescription(order) && (
                <div className={`p-6 border-b ${order.prescription ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <span className={`text-2xl mr-3 ${order.prescription ? '✅' : '⚠️'}`}></span>
                      <div>
                        <p className="font-bold text-gray-900">Prescription Status</p>
                        <p className={`text-sm ${order.prescription ? 'text-green-700' : 'text-red-700'}`}>
                          {order.prescription 
                            ? '✓ Prescription uploaded - Ready to verify' 
                            : '⚠️ Prescription required but NOT uploaded'}
                        </p>
                      </div>
                    </div>
                    {order.prescription ? (
                      <button
                        onClick={() => handleViewPrescription(order.prescription)}
                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium transition ml-4 whitespace-nowrap"
                      >
                        👁️ View Prescription
                      </button>
                    ) : (
                      <div className="px-6 py-2 bg-red-600 text-white rounded font-medium ml-4 whitespace-nowrap">
                        Missing Prescription
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Update Status */}
              <div className="p-6 bg-white border-t flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <span className="text-gray-700 font-semibold">Update Status:</span>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="px-4 py-2 border-2 border-gray-300 rounded font-medium focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processed">Processed</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </label>
                <button
                  onClick={() => setSelectedOrderId(selectedOrderId === order._id ? null : order._id)}
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  {selectedOrderId === order._id ? '▼ Hide Details' : '► Show Full Details'}
                </button>
              </div>

              {/* Expanded Details */}
              {selectedOrderId === order._id && (
                <div className="p-6 bg-gray-100 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-gray-600 uppercase font-bold">Customer Info</p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p><strong>Name:</strong> {order.user?.name || 'N/A'}</p>
                        <p><strong>Email:</strong> {order.user?.email || 'N/A'}</p>
                        <p><strong>Phone:</strong> {order.user?.phoneNumber || 'N/A'}</p>
                        <p><strong>Address:</strong> {order.user?.address || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase font-bold">Order Timeline</p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                        <p><strong>Updated:</strong> {new Date(order.updatedAt).toLocaleString()}</p>
                        <p><strong>Order ID:</strong> <code className="bg-gray-200 px-2 py-1 rounded text-xs break-all">{order._id}</code></p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center mt-12 p-8 bg-white rounded-lg">
            <p className="text-gray-500 text-lg">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;