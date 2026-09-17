import React, { useState, useEffect } from 'react';
import { useParking } from '../context/ParkingContext';
import { slotsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BookmarkCheck, X, AlertCircle, CheckCircle, Clock, LogIn } from 'lucide-react';

export default function ReservationModal() {
  const { activeModal, modalData, closeModal, refreshData } = useParking();
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [vehicleNumber, setVehicleNumber] = useState(user?.vehicleNumber || '');
  const [reservationTime, setReservationTime] = useState('1 Hour From Now');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Support both { slot } (from SlotVisualizer) and { location } (from MapView)
  const [resolvedSlot, setResolvedSlot] = useState(null);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (activeModal !== 'reservation') {
      setResolvedSlot(null);
      setResolving(false);
      setError('');
      setSuccess(false);
      return;
    }

    // If a slot was passed directly, use it
    if (modalData?.slot) {
      setResolvedSlot(modalData.slot);
      return;
    }

    // If a location was passed (from MapView), find the first available slot
    if (modalData?.location) {
      const fetchAvailableSlot = async () => {
        setResolving(true);
        try {
          const res = await slotsAPI.getByLocation(modalData.location._id, { status: 'available' });
          const availableSlots = (res.data || []).filter(s => s.status === 'available');
          if (availableSlots.length > 0) {
            setResolvedSlot(availableSlots[0]);
          } else {
            setError('No available slots at this location');
          }
        } catch (err) {
          setError('Could not load slots for this location');
        } finally {
          setResolving(false);
        }
      };
      fetchAvailableSlot();
    }
  }, [activeModal, modalData]);

  if (activeModal !== 'reservation') return null;

  const targetSlot = resolvedSlot;

  // Guard: require login before reserving
  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div className="glass-card w-full max-w-sm p-6 rounded-2xl border border-slate-700/80 shadow-2xl relative">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto">
              <LogIn className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Login Required</h3>
            <p className="text-xs text-slate-400">Please log in or create an account to pre-book a parking slot.</p>
            <button
              onClick={closeModal}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleReserve = async (e) => {
    e.preventDefault();
    if (!targetSlot) return;
    setLoading(true);
    setError('');
    try {
      await slotsAPI.reserve(targetSlot._id, { customerName, vehicleNumber, reservationTime });
      setSuccess(true);
      await refreshData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reserve slot');
    } finally {
      setLoading(false);
    }
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

        {resolving ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            <Clock className="w-6 h-6 animate-spin mx-auto mb-3 text-amber-400" />
            Finding available slot...
          </div>
        ) : !success ? (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <BookmarkCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-100">Pre-Book Parking Slot</h3>
                <p className="text-xs text-slate-400">Hold slot for future arrival</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl mb-4 text-xs space-y-1.5">
              <div className="flex justify-between"><span className="text-slate-400">Slot Number:</span> <span className="font-extrabold text-amber-400">{targetSlot?.slotNumber || 'Selected Slot'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Floor Level:</span> <span className="font-semibold text-slate-300">{targetSlot?.floor}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Slot Type:</span> <span className="font-semibold capitalize text-slate-300">{targetSlot?.type}</span></div>
            </div>

            <form onSubmit={handleReserve} className="space-y-3.5 text-xs font-medium">
              <div>
                <label className="block text-slate-300 mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Vehicle Plate Number</label>
                <input
                  type="text"
                  placeholder="e.g. CA-9900"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Reservation Time Window</label>
                <select
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="30 Mins From Now">Within Next 30 Mins</option>
                  <option value="1 Hour From Now">Within Next 1 Hour</option>
                  <option value="2 Hours From Now">Within Next 2 Hours</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !targetSlot}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-lg shadow-amber-600/20 disabled:opacity-50"
                >
                  {loading ? 'Holding Slot...' : 'Hold Slot Now'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Slot Reserved!</h3>
            <p className="text-xs text-slate-400">Slot {targetSlot?.slotNumber} is held under {customerName}.</p>
            <button
              onClick={closeModal}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

