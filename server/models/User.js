const mongoose = require('mongoose');
const { Repository } = require('./store');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Operator', 'Customer'], default: 'Customer' },
  phone: { type: String, default: '' },
  vehicleNumber: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const UserModel = new Repository('users', userSchema);
module.exports = UserModel;
