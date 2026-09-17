const VehicleLog = require('../models/VehicleLog');
const Slot = require('../models/Slot');
const Transaction = require('../models/Transaction');

exports.processPayment = async (req, res) => {
  try {
    const { logId, paymentMethod = 'card', paymentGateway = 'Simulated Gateway', amount } = req.body;
    if (!logId) {
      return res.status(400).json({ message: 'logId is required' });
    }

    const log = await VehicleLog.findById(logId);
    if (!log) {
      return res.status(404).json({ message: 'Vehicle log record not found' });
    }

    const transactionId = 'TXN_' + Date.now() + '_' + Math.floor(1000 + Math.random() * 9000);
    const finalAmount = amount || log.totalFee || 5.00;

    // Create Transaction Record
    const transaction = await Transaction.create({
      transactionId,
      logId: log._id,
      vehicleNumber: log.vehicleNumber,
      locationId: log.locationId,
      amount: finalAmount,
      paymentMethod,
      paymentGateway,
      status: 'success',
      paidAt: new Date()
    });

    // Mark VehicleLog completed & paid
    await VehicleLog.findByIdAndUpdate(log._id, {
      status: 'completed',
      paymentStatus: 'paid',
      exitTime: log.exitTime || new Date()
    });

    // Release Slot back to available
    if (log.slotId) {
      await Slot.findByIdAndUpdate(log.slotId, {
        status: 'available',
        occupiedByVehicle: '',
        reservedByCustomer: ''
      });
    }

    res.status(201).json({
      message: 'Payment processed successfully and slot released',
      transaction,
      vehicleLog: log
    });
  } catch (err) {
    res.status(500).json({ message: 'Error processing payment', error: err.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { vehicleNumber } = req.query;
    const filter = {};
    if (vehicleNumber) filter.vehicleNumber = vehicleNumber.toUpperCase();

    const transactions = await Transaction.find(filter);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching transaction history', error: err.message });
  }
};
