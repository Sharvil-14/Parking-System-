const mongoose = require('mongoose');
const { Repository } = require('./store');

const slotSchema = new mongoose.Schema({
  locationId: { type: String, required: true },
  slotNumber: { type: String, required: true },
  floor: { type: String, default: 'Ground' },
  type: { type: String, enum: ['2-wheeler', '4-wheeler', 'EV', 'handicap'], required: true },
  status: { type: String, enum: ['available', 'occupied', 'reserved'], default: 'available' },
  occupiedByVehicle: { type: String, default: '' },
  reservedByCustomer: { type: String, default: '' },
  reservationTime: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const SlotModel = new Repository('slots', slotSchema);
module.exports = SlotModel;
