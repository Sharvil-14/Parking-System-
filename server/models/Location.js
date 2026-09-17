const mongoose = require('mongoose');
const { Repository } = require('./store');

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, default: 'Central City' },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  totalSlots: { type: Number, default: 40 },
  hourlyRates: {
    twoWheeler: { type: Number, default: 2.00 },
    fourWheeler: { type: Number, default: 5.00 },
    ev: { type: Number, default: 7.50 },
    handicap: { type: Number, default: 4.00 }
  },
  operatingHours: { type: String, default: '24/7' },
  image: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const LocationModel = new Repository('locations', locationSchema);
module.exports = LocationModel;
