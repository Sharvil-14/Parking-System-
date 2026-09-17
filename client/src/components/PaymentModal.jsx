import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext';
import { billingAPI } from '../services/api';
import { CreditCard, X, ShieldCheck, CheckCircle2, Lock, Sparkles, DollarSign } from 'lucide-react';

export default function PaymentModal() {
  const { activeModal, modalData, closeModal, openModal, refreshData } = useParking();

  const [paymentGateway, setPaymentGateway] = useState('Stripe Test');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState('Valued Customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (activeModal !== 'payment') return null;

  const checkout = modalData?.checkout;
  const amount = checkout?.totalFee || 10.00;

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await billingAPI.pay({
        logId: checkout?.logId,
        amount,
        paymentMethod: paymentGateway.includes('Razorpay') ? 'razorpay' : 'stripe',
        paymentGateway
      });

      await refreshData();
      openModal('receipt', {
        transaction: res.data.transaction,
        checkout: checkout || {
          vehicleNumber: res.data.transaction.vehicleNumber,
          totalFee: amount,
          entryTime: new Date(Date.now() - 7200000),
          exitTime: new Date(),
          slotNumber: 'G-102',
          locationName: 'Parking Hub'
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Payment processing failed');
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

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-100">Test Payment Checkout</h3>
            <p className="text-xs text-slate-400">Simulated Stripe / Razorpay Integration</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl mb-4 text-xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 block">Total Amount Due</span>
            <span className="text-2xl font-black text-emerald-400">${amount.toFixed(2)}</span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-bold text-[10px]">
            Test Mode Active
          </span>
        </div>

        <form onSubmit={handlePay} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block text-slate-300 mb-1.5 font-semibold">Select Payment Gateway</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentGateway('Stripe Test Gateway')}
                className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                  paymentGateway.includes('Stripe')
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                Stripe Pay
              </button>
              <button
                type="button"
                onClick={() => setPaymentGateway('Razorpay Test Gateway')}
                className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                  paymentGateway.includes('Razorpay')
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                Razorpay
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Cardholder Name</label>
            <input
              type="text"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Card Number (Simulated)</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 font-mono text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-emerald-400" /> 256-Bit SSL Encrypted</span>
            <span>Instant Release</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:opacity-90 text-white font-extrabold text-sm shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-95"
          >
            {loading ? (
              <span>Authorizing Payment...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Pay ${amount.toFixed(2)} & Get Receipt
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
