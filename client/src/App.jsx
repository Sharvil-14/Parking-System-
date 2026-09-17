import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ParkingProvider } from './context/ParkingContext';

import Navbar from './components/Navbar';
import GuardedRoute from './components/GuardedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import OperatorDashboard from './pages/OperatorDashboard';
import CustomerPortal from './pages/CustomerPortal';

// Modals
import EntryModal from './components/EntryModal';
import ExitModal from './components/ExitModal';
import PaymentModal from './components/PaymentModal';
import ReceiptModal from './components/ReceiptModal';
import ReservationModal from './components/ReservationModal';

export default function App() {
  return (
    <AuthProvider>
      <ParkingProvider>
        <Router>
          <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
            <Navbar />
            <main className="flex-1 pb-12">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route
                  path="/admin"
                  element={
                    <GuardedRoute allowedRoles={['Admin']}>
                      <AdminDashboard />
                    </GuardedRoute>
                  }
                />

                <Route
                  path="/operator"
                  element={
                    <GuardedRoute allowedRoles={['Admin', 'Operator']}>
                      <OperatorDashboard />
                    </GuardedRoute>
                  }
                />

                <Route
                  path="/customer"
                  element={
                    <GuardedRoute allowedRoles={['Customer', 'Admin']}>
                      <CustomerPortal />
                    </GuardedRoute>
                  }
                />
              </Routes>
            </main>

            {/* Global Modals */}
            <EntryModal />
            <ExitModal />
            <PaymentModal />
            <ReceiptModal />
            <ReservationModal />

            {/* Footer */}
            <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-400">
              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div>© 2026 Vehicle Parking Management System (VPMS). All rights reserved.</div>
                <div className="flex items-center gap-4 text-slate-400">
                  <span>Google Maps JavaScript & Places API</span>
                  <span>JWT Role-Based Security</span>
                  <span>PDF Receipts</span>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </ParkingProvider>
    </AuthProvider>
  );
}
