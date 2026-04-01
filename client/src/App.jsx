

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

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/medicine/:id" element={<MedicineDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/medicines" element={<AdminMedicinesPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
