import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminShell } from './components/admin/AdminShell';
import { useAuth } from './context/AuthContext';
import { useLocation } from 'react-router-dom';

import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Medicines } from './pages/Medicines';
import { MedicineDetails } from './pages/MedicineDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Orders } from './pages/Orders';
import { Profile } from './pages/Profile';
import { PrescriptionUpload } from './pages/PrescriptionUpload';
import { Notifications } from './pages/Notifications';

import { Dashboard } from './pages/admin/Dashboard';
import { AdminMedicines } from './pages/admin/AdminMedicines';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminPrescriptions } from './pages/admin/AdminPrescriptions';
import { AdminReports } from './pages/admin/AdminReports';

export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppFrame />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

function AppFrame() {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const adminWorkspace = isAdmin && (location.pathname.startsWith('/admin') || location.pathname === '/profile');
  const pageRoutes = <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/medicines" element={<Medicines />} />
                <Route path="/medicines/:id" element={<MedicineDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Registered User Routes */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute userOnly>
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute userOnly>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute userOnly>
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/prescriptions"
                  element={
                    <ProtectedRoute userOnly>
                      <PrescriptionUpload />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute userOnly>
                      <Notifications />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/medicines"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminMedicines />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/categories"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminCategories />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/prescriptions"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminPrescriptions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminReports />
                    </ProtectedRoute>
                  }
                />
  </Routes>;

  if (adminWorkspace) return <AdminShell>{pageRoutes}</AdminShell>;

  return <div className="public-app flex flex-col min-h-screen">
    <Navbar />
    <main className="public-main flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">{pageRoutes}</main>
    <Footer />
  </div>;
}

export default App;
