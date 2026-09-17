import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext';
import { vehiclesAPI } from '../services/api';
import { Car, X, CheckCircle, AlertCircle, PlusCircle } from 'lucide-react';

export default function EntryModal() {
  const { activeModal, modalData, closeModal, selectedLocation, refreshData } = useParking();

  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('4-wheeler');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  if (activeModal !== 'entry') return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicleNumber) {
      setError('Please enter vehicle number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const locationId = modalData?.locationId || selectedLocation?._id;
      const res = await vehiclesAPI.entry({
        vehicleNumber,
        vehicleType,
        locationId,
        ownerName,
        ownerPhone
      });
      setSuccess(res.data);
      await refreshData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error registering vehicle entry');
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    setSuccess(null);
    setVehicleNumber('');
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-slate-700/80 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {!success ? (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-100">Vehicle Entry Registration</h3>
                <p className="text-xs text-slate-400">Auto-assigns nearest available slot by type</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Vehicle Plate Number *</label>
                <input
                  type="text"
                  placeholder="e.g. CA-7890"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-sm uppercase focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="4-wheeler">4-Wheeler (Car/SUV)</option>
                    <option value="2-wheeler">2-Wheeler (Bike/Scooter)</option>
                    <option value="EV">EV (Electric Vehicle)</option>
                    <option value="handicap">Handicap Accessible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Target Facility</label>
                  <input
                    type="text"
                    disabled
                    value={selectedLocation?.name || 'Selected Facility'}
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-400 truncate"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Driver Name (Optional)</label>
                <input
                  type="text"
                  placeholder="Guest Driver"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Driver Phone (Optional)</label>
                <input
                  type="text"
                  placeholder="+1 555-0199"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                >
                  {loading ? 'Assigning...' : 'Confirm Entry'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Vehicle Parked Successfully!</h3>
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl text-left text-xs space-y-2">
              <div className="flex justify-between"><span className="text-slate-400">Assigned Slot:</span> <span className="font-extrabold text-emerald-400 text-sm">{success.assignedSlot?.slotNumber}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Floor Level:</span> <span className="font-semibold text-slate-200">{success.assignedSlot?.floor}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Vehicle Plate:</span> <span className="font-mono font-bold text-blue-400">{success.vehicleLog?.vehicleNumber}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Entry Timestamp:</span> <span className="text-slate-300">{new Date(success.vehicleLog?.entryTime).toLocaleTimeString()}</span></div>
            </div>
            <button
              onClick={handleDone}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg"
            >
              Done & Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
