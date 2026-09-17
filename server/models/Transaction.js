const mongoose = require('mongoose');
const { Repository } = require('./store');

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true },
  logId: { type: String, required: true },
  vehicleNumber: { type: String, required: true },
  locationId: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['card', 'upi', 'cash', 'stripe', 'razorpay'], default: 'card' },
  paymentGateway: { type: String, default: 'Simulated Gateway' },
  status: { type: String, enum: ['success', 'failed'], default: 'success' },
  paidAt: { type: Date, default: Date.now },
  receiptUrl: { type: String, default: '' }
});

const TransactionModel = new Repository('transactions', transactionSchema);
module.exports = TransactionModel;
