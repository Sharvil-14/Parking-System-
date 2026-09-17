import React, { useState, useEffect } from 'react';
import { useParking } from '../context/ParkingContext';
import { vehiclesAPI } from '../services/api';
import { LogOut, X, Clock, DollarSign, AlertCircle, CreditCard } from 'lucide-react';

export default function ExitModal() {
  const { activeModal, modalData, closeModal, openModal } = useParking();

  const [vehicleNumber, setVehicleNumber] = useState('');
  const [checkoutData, setCheckoutData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeModal === 'exit' && modalData?.vehicleNumber) {
      setVehicleNumber(modalData.vehicleNumber);
      handleCalculateExit(modalData.vehicleNumber);
    }
  }, [activeModal, modalData]);

  if (activeModal !== 'exit') return null;

  const handleCalculateExit = async (vNo) => {
    const targetNo = vNo || vehicleNumber;
    if (!targetNo) {
      setError('Please provide vehicle plate number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await vehiclesAPI.exit({ vehicleNumber: targetNo });
      setCheckoutData(res.data.checkout);
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing vehicle checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = () => {
    openModal('payment', { checkout: checkoutData });
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

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
            <LogOut className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-100">Vehicle Exit Checkout</h3>
            <p className="text-xs text-slate-400">Duration fee calculation & slot release</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!checkoutData ? (
          <form onSubmit={(e) => { e.preventDefault(); handleCalculateExit(); }} className="space-y-4 text-xs font-medium">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Enter Vehicle Plate Number</label>
              <input
                type="text"
                placeholder="e.g. CA-7890"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-sm uppercase focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg transition-all"
            >
              {loading ? 'Calculating...' : 'Calculate Fee'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl text-xs space-y-2.5">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">Vehicle Number:</span>
                <span className="font-mono font-bold text-sm text-blue-400">{checkoutData.vehicleNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Slot & Facility:</span>
                <span className="font-semibold text-slate-200">{checkoutData.slotNumber} ({checkoutData.locationName})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Entry Time:</span>
                <span className="text-slate-300">{new Date(checkoutData.entryTime).toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Exit Time:</span>
                <span className="text-slate-300">{new Date(checkoutData.exitTime).toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Duration (Billed):</span>
                <span className="font-semibold text-amber-400">{checkoutData.billedHours} Hour(s)</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-800 pt-2 text-sm">
                <span className="font-bold text-slate-200">Total Payable Fee:</span>
                <span className="font-black text-emerald-400 text-base">${checkoutData.totalFee.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCheckoutData(null)}
                className="w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleProceedToPayment}
                className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all"
              >
                <CreditCard className="w-4 h-4" /> Pay & Release Slot
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
