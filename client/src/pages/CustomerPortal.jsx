import React, { useState, useEffect } from 'react';
import { billingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useParking } from '../context/ParkingContext';
import MapView from '../components/MapView';
import { generatePDFReceipt } from '../utils/pdfGenerator';
import { User, MapPin, BookmarkCheck, Download, History, Car, CheckCircle2 } from 'lucide-react';

export default function CustomerPortal() {
  const { user } = useAuth();
  const { locations, setSelectedLocation, openModal } = useParking();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await billingAPI.getTransactions(user?.vehicleNumber);
        setTransactions(res.data);
      } catch (err) {
        console.error('Error fetching transaction history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-100 flex items-center gap-2">
            <User className="w-8 h-8 text-indigo-400" /> Customer Parking Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search nearby parking, pre-book slots, and download official receipts
          </p>
        </div>
      </div>

      {/* Map Search */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-400" /> Nearby Parking Facilities & Live Availability
        </h2>
        <MapView onSelectLocation={(loc) => setSelectedLocation(loc)} />
      </div>

      {/* Booking History & Downloadable Receipts */}
      <div className="glass-card p-6 rounded-2xl border border-slate-700/60 space-y-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-400" /> My Booking History & Receipts
        </h2>

        {loading ? (
          <div className="py-8 text-center text-slate-400">Loading history...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Transaction ID</th>
                  <th className="p-3">Vehicle Number</th>
                  <th className="p-3">Gateway</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Paid Date</th>
                  <th className="p-3 text-right">PDF Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-mono font-extrabold text-blue-400">{tx.transactionId}</td>
                    <td className="p-3 font-mono font-bold text-slate-200">{tx.vehicleNumber}</td>
                    <td className="p-3 font-semibold text-slate-300">{tx.paymentGateway} ({tx.paymentMethod})</td>
                    <td className="p-3 font-black text-emerald-400">${tx.amount?.toFixed(2)}</td>
                    <td className="p-3 text-slate-400">{new Date(tx.paidAt).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => generatePDFReceipt(tx, { vehicleNumber: tx.vehicleNumber, totalFee: tx.amount })}
                        className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white font-bold text-[11px] transition-all flex items-center gap-1 ml-auto"
                      >
                        <Download className="w-3.5 h-3.5" /> Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {transactions.length === 0 && !loading && (
          <div className="py-8 text-center text-slate-400">
            No completed parking transactions found for your vehicle.
          </div>
        )}
      </div>
    </div>
  );
}
