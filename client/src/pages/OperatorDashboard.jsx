import React, { useState, useEffect } from 'react';
import { vehiclesAPI, slotsAPI } from '../services/api';
import { useParking } from '../context/ParkingContext';
import { Shield, PlusCircle, LogOut, Car, Clock, RefreshCw, MapPin, DollarSign, Search, BookmarkCheck, UserCheck, AlertCircle } from 'lucide-react';

export default function OperatorDashboard() {
  const [activeVehicles, setActiveVehicles] = useState([]);
  const [reservedSlots, setReservedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reservationsLoading, setReservationsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [checkInLoading, setCheckInLoading] = useState(null); // slotId being checked in
  const [checkInError, setCheckInError] = useState('');
  const { openModal, selectedLocation, refreshData } = useParking();

  const fetchActiveVehicles = async () => {
    setLoading(true);
    try {
      const res = await vehiclesAPI.getActive(selectedLocation?._id);
      setActiveVehicles(res.data);
    } catch (err) {
      console.error('Error fetching active vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservedSlots = async () => {
    setReservationsLoading(true);
    try {
      const res = await slotsAPI.getReserved(selectedLocation?._id);
      setReservedSlots(res.data);
    } catch (err) {
      console.error('Error fetching reservations:', err);
    } finally {
      setReservationsLoading(false);
    }
  };

  const refreshAll = () => {
    fetchActiveVehicles();
    fetchReservedSlots();
  };

  useEffect(() => {
    refreshAll();
  }, [selectedLocation]);

  const handleCheckIn = async (slot) => {
    setCheckInLoading(slot._id);
    setCheckInError('');
    try {
      await vehiclesAPI.entry({
        vehicleNumber: slot.reservedByCustomer || 'WALK-IN',
        vehicleType: slot.type,
        locationId: slot.locationId,
        ownerName: slot.reservedByCustomer || 'Customer',
        slotId: slot._id
      });
      await refreshData();
      refreshAll();
    } catch (err) {
      setCheckInError(err.response?.data?.message || 'Check-in failed');
    } finally {
      setCheckInLoading(null);
    }
  };

  const filteredVehicles = activeVehicles.filter(v =>
    v.vehicleNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
    v.slotNumber.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const formatReservationTime = (timeStr) => {
    if (!timeStr) return '—';
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return timeStr;
    return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-100 flex items-center gap-2">
            <Shield className="w-8 h-8 text-emerald-400" /> Operator Control Desk
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time vehicle entry registration, slot assignment & checkout fee desk
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshAll}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh All"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => openModal('entry')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Register Vehicle Entry
          </button>
        </div>
      </div>

      {/* Pending Customer Reservations */}
      <div className="glass-card p-6 rounded-2xl border border-amber-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-amber-400" /> Pending Customer Reservations ({reservedSlots.length})
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
            Pre-booked — awaiting arrival
          </span>
        </div>

        {checkInError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{checkInError}</span>
          </div>
        )}

        {reservationsLoading ? (
          <div className="py-8 text-center text-slate-400">Loading reservations...</div>
        ) : reservedSlots.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            No pending customer reservations at this facility.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Slot Number</th>
                  <th className="p-3">Floor</th>
                  <th className="p-3">Slot Type</th>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Reserved At</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {reservedSlots.map((slot) => (
                  <tr key={slot._id} className="hover:bg-amber-500/5 transition-colors">
                    <td className="p-3 font-bold text-amber-400 text-sm">{slot.slotNumber}</td>
                    <td className="p-3 font-semibold text-slate-300">{slot.floor}</td>
                    <td className="p-3 font-semibold text-slate-300 capitalize">{slot.type}</td>
                    <td className="p-3 font-semibold text-slate-200">{slot.reservedByCustomer || '—'}</td>
                    <td className="p-3 text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {formatReservationTime(slot.reservationTime)}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleCheckIn(slot)}
                        disabled={checkInLoading === slot._id}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white font-bold text-[11px] transition-all flex items-center gap-1 ml-auto disabled:opacity-50"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        {checkInLoading === slot._id ? 'Checking In...' : 'Check In'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active Vehicles Table */}
      <div className="glass-card p-6 rounded-2xl border border-slate-700/60 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-400" /> Currently Parked Vehicles ({activeVehicles.length})
          </h2>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search plate or slot..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading active vehicles...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Vehicle Number</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Slot Number</th>
                  <th className="p-3">Entry Time</th>
                  <th className="p-3">Duration (Live)</th>
                  <th className="p-3">Est. Fee</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredVehicles.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-mono font-extrabold text-blue-400 text-sm">{log.vehicleNumber}</td>
                    <td className="p-3 font-semibold text-slate-300 capitalize">{log.vehicleType}</td>
                    <td className="p-3 font-bold text-emerald-400">{log.slotNumber}</td>
                    <td className="p-3 text-slate-400">{new Date(log.entryTime).toLocaleTimeString()}</td>
                    <td className="p-3 font-semibold text-amber-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {log.currentDurationHours} hrs
                    </td>
                    <td className="p-3 font-extrabold text-slate-100">${log.estimatedFee?.toFixed(2)}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => openModal('exit', { vehicleNumber: log.vehicleNumber, slotNumber: log.slotNumber })}
                        className="px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600 hover:text-white font-bold text-[11px] transition-all flex items-center gap-1 ml-auto"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Checkout & Pay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredVehicles.length === 0 && !loading && (
          <div className="py-12 text-center text-slate-400">
            No active vehicles currently parked matching query.
          </div>
        )}
      </div>
    </div>
  );
}

