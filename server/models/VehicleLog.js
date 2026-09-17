const mongoose = require('mongoose');
const { Repository } = require('./store');

const vehicleLogSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true },
  vehicleType: { type: String, enum: ['2-wheeler', '4-wheeler', 'EV', 'handicap'], required: true },
  ownerName: { type: String, default: 'Guest Driver' },
  ownerPhone: { type: String, default: '' },
  locationId: { type: String, required: true },
  slotId: { type: String, required: true },
  slotNumber: { type: String, required: true },
  entryTime: { type: Date, default: Date.now },
  exitTime: { type: Date, default: null },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  durationHours: { type: Number, default: 0 },
  totalFee: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const VehicleLogModel = new Repository('vehicleLogs', vehicleLogSchema);
module.exports = VehicleLogModel;
