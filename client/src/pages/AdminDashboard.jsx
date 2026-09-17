import React, { useState, useEffect } from 'react';
import { analyticsAPI, locationsAPI } from '../services/api';
import { useParking } from '../context/ParkingContext';
import StatCard from '../components/StatCard';
import { PeakHoursChart, RevenueBreakdownChart } from '../components/ChartCard';
import MapView from '../components/MapView';
import { LayoutDashboard, MapPin, DollarSign, Car, ShieldAlert, Plus, Trash2, CheckCircle, AlertTriangle, Layers } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);

  // New Location Form State
  const [newLocName, setNewLocName] = useState('');
  const [newLocAddress, setNewLocAddress] = useState('');
  const [newLocSlots, setNewLocSlots] = useState(30);

  const { locations, refreshData } = useParking();

  const fetchDashboardData = async () => {
    try {
      const res = await analyticsAPI.getDashboard();
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch admin analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAddLocation = async (e) => {
    e.preventDefault();
    try {
      await locationsAPI.create({
        name: newLocName,
        address: newLocAddress,
        totalSlots: Number(newLocSlots)
      });
      setShowAddLocationModal(false);
      setNewLocName('');
      setNewLocAddress('');
      await refreshData();
      await fetchDashboardData();
    } catch (err) {
      alert('Error creating location: ' + err.message);
    }
  };

  const handleDeleteLocation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this parking location and all its slots?')) return;
    try {
      await locationsAPI.delete(id);
      await refreshData();
      await fetchDashboardData();
    } catch (err) {
      alert('Error deleting location: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const metrics = data?.metrics || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-100 flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8 text-blue-400" /> Admin Command Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time occupancy analytics, revenue insights, overstay alerts & facility management
          </p>
        </div>

        <button
          onClick={() => setShowAddLocationModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Location
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Occupancy"
          value={`${metrics.overallOccupancy ?? 0}%`}
          subtitle={`${metrics.occupiedSlots ?? 0} / ${metrics.totalSlots ?? 0} slots currently occupied`}
          icon={Car}
          color="blue"
          trend="+4.2%"
        />
        <StatCard
          title="Total Gross Revenue"
          value={`$${(metrics.totalRevenue ?? 0).toFixed(2)}`}
          subtitle="Processed via test payments & logs"
          icon={DollarSign}
          color="emerald"
          trend="+12.5%"
        />
        <StatCard
          title="Active Parking Locations"
          value={metrics.totalLocations ?? 0}
          subtitle="Managed parking facilities"
          icon={MapPin}
          color="purple"
        />
        <StatCard
          title="Available Free Slots"
          value={metrics.availableSlots ?? 0}
          subtitle="Across all parking lots"
          icon={CheckCircle}
          color="amber"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PeakHoursChart data={data?.hourlyPeakData || []} />
        <RevenueBreakdownChart data={data?.vehicleTypeRevenue || []} />
      </div>

      {/* Real-time Alerts Panel */}
      {data?.alerts && data.alerts.length > 0 && (
        <div className="glass-card p-5 rounded-2xl border border-rose-500/30 bg-rose-950/10 space-y-3">
          <h3 className="font-bold text-rose-400 text-sm flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" /> Active System Notifications & Overstay Alerts ({data.alerts.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.alerts.map((alert) => (
              <div key={alert.id} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-rose-400">{alert.title}</span>
                  <span className="text-[10px] text-slate-500">{alert.timestamp}</span>
                </div>
                <p className="text-slate-300 text-[11px]">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locations Management Table */}
      <div className="glass-card p-6 rounded-2xl border border-slate-700/60 space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-purple-400" /> Manage Parking Facilities & Auto-Geocoding
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Facility Name</th>
                <th className="p-3">Address</th>
                <th className="p-3">Total Slots</th>
                <th className="p-3">Available</th>
                <th className="p-3">Occupancy</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {locations.map((loc) => (
                <tr key={loc._id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 font-extrabold text-slate-100">{loc.name}</td>
                  <td className="p-3 text-slate-400">{loc.address}</td>
                  <td className="p-3 font-semibold text-slate-200">{loc.totalSlots}</td>
                  <td className="p-3 font-bold text-emerald-400">{loc.stats?.available ?? 0}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      (loc.stats?.occupancyPercentage ?? 0) > 85 ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {loc.stats?.occupancyPercentage ?? 0}%
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeleteLocation(loc._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete Location"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Location Modal */}
      {showAddLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-slate-700/80 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Add New Parking Location</h3>
            <form onSubmit={handleAddLocation} className="space-y-3 text-xs font-medium">
              <div>
                <label className="block text-slate-300 mb-1">Facility Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Airport North Terminal Garage"
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Street Address (Auto-Geocodes) *</label>
                <input
                  type="text"
                  placeholder="e.g. 500 Howard Street, San Francisco, CA"
                  value={newLocAddress}
                  onChange={(e) => setNewLocAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Initial Capacity (Total Slots)</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={newLocSlots}
                  onChange={(e) => setNewLocSlots(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddLocationModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Create & Auto-Generate Slots
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
