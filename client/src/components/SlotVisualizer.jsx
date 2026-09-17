import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext';
import { useAuth } from '../context/AuthContext';
import { slotsAPI } from '../services/api';
import { Car, Zap, Accessibility, ShieldAlert, CheckCircle, Clock, Plus, Filter, User, Lock } from 'lucide-react';

export default function SlotVisualizer() {
  const { slots, selectedLocation, openModal, refreshData } = useParking();
  const { user } = useAuth();

  const [floorFilter, setFloorFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  if (!selectedLocation) {
    return (
      <div className="glass-card p-8 rounded-2xl text-center text-slate-400">
        Please select a parking location to view floor slots layout.
      </div>
    );
  }

  // Filter slots
  const filteredSlots = slots.filter(slot => {
    if (floorFilter !== 'All' && slot.floor !== floorFilter) return false;
    if (typeFilter !== 'All' && slot.type !== typeFilter) return false;
    if (statusFilter !== 'All' && slot.status !== statusFilter) return false;
    return true;
  });

  const floors = ['All', ...new Set(slots.map(s => s.floor))];
  const types = ['All', '2-wheeler', '4-wheeler', 'EV', 'handicap'];
  const statuses = ['All', 'available', 'occupied', 'reserved'];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'EV': return <Zap className="w-4 h-4 text-amber-400 inline" />;
      case 'handicap': return <Accessibility className="w-4 h-4 text-purple-400 inline" />;
      case '2-wheeler': return <Car className="w-3.5 h-3.5 text-teal-400 inline" />;
      default: return <Car className="w-4 h-4 text-blue-400 inline" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Available</span>;
      case 'occupied':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">Occupied</span>;
      case 'reserved':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">Reserved</span>;
      default:
        return null;
    }
  };

  const handleSlotClick = async (slot) => {
    if (slot.status === 'available') {
      if (user?.role === 'Admin' || user?.role === 'Operator') {
        openModal('entry', { locationId: selectedLocation._id, targetSlot: slot });
      } else {
        openModal('reservation', { slot });
      }
    } else if (slot.status === 'occupied') {
      if (user?.role === 'Admin' || user?.role === 'Operator') {
        openModal('exit', { vehicleNumber: slot.occupiedByVehicle, slotNumber: slot.slotNumber });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="glass-card p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-400" />
            Floor-Wise Slot Grid - <span className="text-blue-400">{selectedLocation.name}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time interactive slot assignment. Click any available slot to park or reserve.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1.5 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">Floor:</span>
            <select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              {floors.map(f => <option key={f} value={f} className="bg-slate-900">{f}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1.5 rounded-xl">
            <span className="text-slate-400 font-medium">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              {types.map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1.5 rounded-xl">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              {statuses.map(s => <option key={s} value={s} className="bg-slate-900 capitalize">{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Slots */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredSlots.map((slot) => {
          let cardBg = 'bg-slate-900/90 border-slate-700/60 hover:border-emerald-500/60';
          let borderGlow = 'shadow-emerald-500/5';
          if (slot.status === 'occupied') {
            cardBg = 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500';
            borderGlow = 'shadow-rose-500/10';
          } else if (slot.status === 'reserved') {
            cardBg = 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500';
            borderGlow = 'shadow-amber-500/10';
          }

          return (
            <div
              key={slot._id}
              onClick={() => handleSlotClick(slot)}
              className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer shadow-lg ${cardBg} ${borderGlow} flex flex-col justify-between group hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-slate-100 text-sm tracking-wide group-hover:text-blue-400 transition-colors">
                  {slot.slotNumber}
                </span>
                <span className="p-1 rounded-lg bg-slate-800 border border-slate-700">
                  {getTypeIcon(slot.type)}
                </span>
              </div>

              <div className="my-1.5 space-y-1">
                <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                  <span>{slot.floor}</span>
                  <span className="capitalize text-[10px] text-slate-400">{slot.type}</span>
                </div>
                {getStatusBadge(slot.status)}
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 truncate">
                {slot.status === 'occupied' && (
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <Car className="w-3 h-3 inline" /> {slot.occupiedByVehicle || 'PARKED'}
                  </span>
                )}
                {slot.status === 'reserved' && (
                  <span className="text-amber-400 font-medium flex items-center gap-1">
                    <User className="w-3 h-3 inline" /> {slot.reservedByCustomer || 'RESERVED'}
                  </span>
                )}
                {slot.status === 'available' && (
                  <span className="text-emerald-400/80 group-hover:text-emerald-400 font-medium">
                    + Click to Assign
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredSlots.length === 0 && (
        <div className="glass-card p-12 rounded-2xl text-center text-slate-400">
          No slots match the current filter options.
        </div>
      )}
    </div>
  );
}
