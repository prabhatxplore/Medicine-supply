import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AdminMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    requiresPrescription: false,
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/medicines');
      const data = await response.json();
      setMedicines(data);
    } catch (err) {
      toast.error('Failed to load medicines');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    if (image) {
      data.append('image', image);
    }

    try {
      const response = await fetch('http://localhost:3000/api/medicines', {
        method: 'POST',
        body: data,
      });

      if (response.ok) {
        toast.success('Medicine added successfully');
        setFormData({
          name: '',
          description: '',
          price: '',
          quantity: '',
          requiresPrescription: false,
        });
        setImage(null);
        setShowForm(false);
        fetchMedicines();
      } else {
        toast.error('Failed to add medicine');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md p-4 mb-8">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Pharmacy Admin</h1>
          <div className="space-x-4">
            <a href="/admin" className="text-gray-700 hover:text-blue-600 font-semibold">Dashboard</a>
            <a href="/admin/orders" className="text-gray-700 hover:text-blue-600 font-semibold">Orders</a>
            <a href="/" className="text-gray-700 hover:text-blue-600 font-semibold">Logout</a>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Manage Medicines</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'Add Medicine'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold mb-4">Add New Medicine</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name"
                type="text"
                placeholder="Medicine Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                rows="3"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={formData.price}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded"
                  required
                />
                <input
                  name="quantity"
                  type="number"
                  placeholder="Quantity in Stock"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  name="requiresPrescription"
                  type="checkbox"
                  checked={formData.requiresPrescription}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <label>Requires Prescription</label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Medicine Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 w-full"
              >
                Add Medicine
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medicines.map((medicine) => (
            <div key={medicine._id} className="bg-white p-6 rounded-lg shadow-md">
              {medicine.image && (
                <img
                  src={medicine.image.startsWith('http') ? medicine.image : `http://localhost:3000/${medicine.image}`}
                  alt={medicine.name}
                  className="w-full h-40 object-cover mb-4 rounded"
                />
              )}
              <h3 className="text-xl font-bold mb-2">{medicine.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{medicine.description}</p>
              <p className="text-lg font-semibold text-green-600 mb-1">${medicine.price}</p>
              <p className="text-sm mb-2">
                Stock: <span className={medicine.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                  {medicine.quantity}
                </span>
              </p>
              {medicine.requiresPrescription && (
                <p className="text-sm text-red-600 font-semibold">Requires Prescription</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminMedicines;