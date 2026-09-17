import React from 'react';
import { useParking } from '../context/ParkingContext';
import { generatePDFReceipt } from '../utils/pdfGenerator';
import { CheckCircle2, Download, X, Printer, ShieldCheck, Car, Calendar, DollarSign } from 'lucide-react';

export default function ReceiptModal() {
  const { activeModal, modalData, closeModal } = useParking();

  if (activeModal !== 'receipt') return null;

  const transaction = modalData?.transaction;
  const checkout = modalData?.checkout;

  const handleDownloadPDF = () => {
    generatePDFReceipt(transaction, checkout);
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

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-slate-100">Payment Completed!</h3>
          <p className="text-xs text-slate-400">Slot release voucher & official receipt</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl text-xs space-y-2.5 mb-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-slate-400">Receipt No:</span>
            <span className="font-mono font-bold text-blue-400">{transaction?.transactionId}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Vehicle Number:</span>
            <span className="font-mono font-bold text-slate-200">{checkout?.vehicleNumber}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Facility Location:</span>
            <span className="font-semibold text-slate-300">{checkout?.locationName}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Slot Released:</span>
            <span className="font-bold text-emerald-400">{checkout?.slotNumber}</span>
          </div>

          <div className="flex justify-between items-center border-t border-slate-800 pt-2 text-sm">
            <span className="font-bold text-slate-200">Amount Paid:</span>
            <span className="font-black text-emerald-400 text-base">
              ${(transaction?.amount || checkout?.totalFee || 0).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={closeModal}
            className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleDownloadPDF}
            className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/20 flex items-center justify-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
