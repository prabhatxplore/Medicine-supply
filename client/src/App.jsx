

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import MedicineDetailsPage from './pages/MedicineDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminMedicinesPage from './pages/AdminMedicinesPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import VolunteerLoginPage from './pages/VolunteerLoginPage';
import VolunteerDashboardPage from './pages/VolunteerDashboardPage';
import ProductsPage from './pages/ProductsPage';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "12px",
            background: "#0f172a",
            color: "#f8fafc",
            border: "1px solid #1e293b",
          },
          success: {
            style: {
              border: "1px solid #065f46",
            },
          },
          error: {
            style: {
              border: "1px solid #7f1d1d",
            },
          },
        }}
      />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/medicine/:id" element={<MedicineDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/products" element={<ProductsPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/medicines" element={<AdminMedicinesPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />

          {/* Volunteer Routes */}
          <Route path="/volunteer/login" element={<VolunteerLoginPage />} />
          <Route path="/volunteer" element={<VolunteerDashboardPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
