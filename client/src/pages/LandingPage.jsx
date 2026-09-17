import React from 'react';
import { useParking } from '../context/ParkingContext';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/MapView';
import SlotVisualizer from '../components/SlotVisualizer';
import { MapPin, Navigation, Car, Zap, Accessibility, ShieldCheck, ArrowRight, Search, PlusCircle } from 'lucide-react';

export default function LandingPage() {
  const { locations, selectedLocation, setSelectedLocation, searchQuery, setSearchQuery, openModal } = useParking();
  const { user } = useAuth();

  const filteredLocations = locations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Section */}
      <div className="relative glass-card p-6 sm:p-8 rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-transparent rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ShieldCheck className="w-4 h-4 text-blue-400" /> Real-Time Smart Parking Visibility
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-100 tracking-tight leading-tight">
              Find, Reserve & Park in <span className="gradient-text">Seconds</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base">
              Interactive Google Maps lot visibility, automated slot assignment, duration billing, and instant digital PDF receipts.
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full lg:w-96 space-y-3">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search parking near me or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700/90 rounded-2xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>
            {(user?.role === 'Admin' || user?.role === 'Operator') && (
              <button
                onClick={() => openModal('entry')}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-95"
              >
                <PlusCircle className="w-5 h-5" /> Park New Vehicle
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Centerpiece Map Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-emerald-400" /> Interactive Facility Map
            </h2>
            <p className="text-xs text-slate-400">
              Live status markers: <span className="text-emerald-400 font-bold">Green = Available</span>, <span className="text-amber-400 font-bold">Yellow = High Occupancy</span>, <span className="text-rose-400 font-bold">Red = Full</span>
            </p>
          </div>
        </div>

        <MapView onSelectLocation={(loc) => setSelectedLocation(loc)} />
      </section>

      {/* Facility Cards Grid */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-100">All Parking Locations ({filteredLocations.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredLocations.map((loc) => {
            const isSelected = selectedLocation && String(selectedLocation._id) === String(loc._id);
            const available = loc.stats?.available ?? 0;
            const isFull = available === 0;

            return (
              <div
                key={loc._id}
                onClick={() => setSelectedLocation(loc)}
                className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer glass-card ${
                  isSelected ? 'border-blue-500 shadow-blue-500/20 ring-1 ring-blue-500' : 'border-slate-700/60 hover:border-slate-500'
                } space-y-3 flex flex-col justify-between`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-extrabold text-slate-100 text-base leading-snug">{loc.name}</h4>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                      isFull ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {isFull ? 'FULL' : `${available} FREE`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" /> {loc.address}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/80 p-2.5 rounded-xl text-slate-300 border border-slate-800">
                  <div>4W Rate: <b className="text-emerald-400">${loc.hourlyRates?.fourWheeler?.toFixed(2)}/hr</b></div>
                  <div>2W Rate: <b className="text-emerald-400">${loc.hourlyRates?.twoWheeler?.toFixed(2)}/hr</b></div>
                  <div>EV Rate: <b className="text-amber-400">${loc.hourlyRates?.ev?.toFixed(2)}/hr</b></div>
                  <div>Hours: <b className="text-slate-200">{loc.operatingHours}</b></div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold text-[11px]">
                    Occupancy: {loc.stats?.occupancyPercentage ?? 0}%
                  </span>
                  <span className="text-blue-400 font-bold flex items-center gap-1 group">
                    View Slots <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Visual Slot Layout */}
      <section className="pt-4">
        <SlotVisualizer />
      </section>
    </div>
  );
}
