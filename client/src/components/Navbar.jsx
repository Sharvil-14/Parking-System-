import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useParking } from '../context/ParkingContext';
import { Car, MapPin, LayoutDashboard, Shield, LogOut, User, PlusCircle, Search } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { locations, selectedLocation, setSelectedLocation, openModal } = useParking();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight gradient-text">VPMS</span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-blue-400 border border-slate-700">
              Live Map v1.0
            </span>
          </div>
        </Link>

        {/* Location Dropdown selector */}
        {locations.length > 0 && (
          <div className="hidden md:flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5 text-sm">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400 font-medium text-xs">Active Facility:</span>
            <select
              value={selectedLocation?._id || ''}
              onChange={(e) => {
                const loc = locations.find(l => String(l._id) === String(e.target.value));
                if (loc) setSelectedLocation(loc);
              }}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              {locations.map((loc) => (
                <option key={loc._id} value={loc._id} className="bg-slate-900 text-slate-200">
                  {loc.name} ({loc.stats?.available ?? 0} available)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              location.pathname === '/' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Map & Slots</span>
          </Link>

          {user && (user.role === 'Admin' || user.role === 'Operator') && (
            <button
              onClick={() => openModal('entry')}
              className="px-3 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Park Vehicle</span>
            </button>
          )}

          {user?.role === 'Admin' && (
            <Link
              to="/admin"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                location.pathname === '/admin' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden md:inline">Admin Analytics</span>
            </Link>
          )}

          {user?.role === 'Operator' && (
            <Link
              to="/operator"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                location.pathname === '/operator' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Operator Desk</span>
            </Link>
          )}

          {user?.role === 'Customer' && (
            <Link
              to="/customer"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                location.pathname === '/customer' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <User className="w-4 h-4 text-indigo-400" />
              <span className="hidden md:inline">My Bookings</span>
            </Link>
          )}

          {/* User Auth Section */}
          {user ? (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-800">
              <div className="text-right hidden xl:block">
                <div className="text-xs font-semibold text-slate-200">{user.name}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400">{user.role}</div>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link
                to="/login"
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
