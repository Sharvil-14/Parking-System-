const VehicleLog = require('../models/VehicleLog');
const Slot = require('../models/Slot');
const Location = require('../models/Location');

// Helper: Calculate billing fee based on duration and vehicle type
const calculateFee = (entryTime, exitTime, hourlyRates, vehicleType) => {
  const durationMs = new Date(exitTime) - new Date(entryTime);
  const rawHours = Math.max(durationMs / (1000 * 60 * 60), 0.25); // Min 15 mins
  const billedHours = Math.ceil(rawHours); // Rounded up to nearest full hour

  let ratePerHour = 5.00;
  if (vehicleType === '2-wheeler') ratePerHour = hourlyRates.twoWheeler || 2.00;
  else if (vehicleType === '4-wheeler') ratePerHour = hourlyRates.fourWheeler || 5.00;
  else if (vehicleType === 'EV') ratePerHour = hourlyRates.ev || 7.50;
  else if (vehicleType === 'handicap') ratePerHour = hourlyRates.handicap || 4.00;

  const totalFee = Number((billedHours * ratePerHour).toFixed(2));
  return {
    rawHours: Number(rawHours.toFixed(2)),
    billedHours,
    ratePerHour,
    totalFee
  };
};

exports.registerVehicleEntry = async (req, res) => {
  try {
    const { vehicleNumber, vehicleType, locationId, ownerName, ownerPhone, slotId } = req.body;
    if (!vehicleNumber || !vehicleType || !locationId) {
      return res.status(400).json({ message: 'Vehicle number, vehicle type, and locationId are required' });
    }

    const cleanVehicleNo = vehicleNumber.toUpperCase().trim();

    // Check if vehicle is already parked active
    const activeLog = await VehicleLog.findOne({ vehicleNumber: cleanVehicleNo, status: 'active' });
    if (activeLog) {
      return res.status(400).json({ message: `Vehicle ${cleanVehicleNo} is already parked in Slot ${activeLog.slotNumber}` });
    }

    let targetSlot;

    if (slotId) {
      // Check-in from a reservation: use the specific reserved slot
      targetSlot = await Slot.findById(slotId);
      if (!targetSlot) {
        return res.status(404).json({ message: 'Specified slot not found' });
      }
      if (targetSlot.status !== 'available' && targetSlot.status !== 'reserved') {
        return res.status(400).json({ message: `Slot ${targetSlot.slotNumber} is currently ${targetSlot.status} and cannot be checked in` });
      }
    } else {
      // Auto-assign nearest available slot matching vehicle type
      const availableSlots = await Slot.find({ locationId, status: 'available' });
      const matchingSlots = availableSlots.filter(s => s.type === vehicleType);

      // Fallback to any available slot if matching type not found
      targetSlot = matchingSlots.length > 0 ? matchingSlots[0] : availableSlots[0];
    }

    if (!targetSlot) {
      return res.status(400).json({ message: 'No available parking slots at this location for this vehicle type' });
    }

    // Create Vehicle Log
    const newLog = await VehicleLog.create({
      vehicleNumber: cleanVehicleNo,
      vehicleType,
      ownerName: ownerName || 'Guest Driver',
      ownerPhone: ownerPhone || '',
      locationId,
      slotId: targetSlot._id,
      slotNumber: targetSlot.slotNumber,
      entryTime: new Date(),
      status: 'active',
      paymentStatus: 'pending'
    });

    // Mark slot as occupied and clear any reservation fields
    await Slot.findByIdAndUpdate(targetSlot._id, {
      status: 'occupied',
      occupiedByVehicle: cleanVehicleNo,
      reservedByCustomer: '',
      reservationTime: ''
    });

    res.status(201).json({
      message: `Vehicle ${cleanVehicleNo} registered & assigned to Slot ${targetSlot.slotNumber}`,
      vehicleLog: newLog,
      assignedSlot: targetSlot
    });
  } catch (err) {
    res.status(500).json({ message: 'Error registering vehicle entry', error: err.message });
  }
};

exports.getActiveVehicles = async (req, res) => {
  try {
    const { locationId } = req.query;
    const filter = { status: 'active' };
    if (locationId) filter.locationId = locationId;

    const logs = await VehicleLog.find(filter);
    const locations = await Location.find();

    const enriched = logs.map(log => {
      const loc = locations.find(l => String(l._id) === String(log.locationId));
      const entryDate = new Date(log.entryTime);
      const now = new Date();
      const currentDurationHours = Math.max((now - entryDate) / (1000 * 60 * 60), 0.1);
      const hourlyRate = loc ? (loc.hourlyRates[log.vehicleType === '2-wheeler' ? 'twoWheeler' : log.vehicleType === '4-wheeler' ? 'fourWheeler' : log.vehicleType === 'EV' ? 'ev' : 'handicap'] || 5) : 5;
      const estimatedFee = Number((Math.ceil(currentDurationHours) * hourlyRate).toFixed(2));

      return {
        ...log,
        locationName: loc ? loc.name : 'Main Facility',
        currentDurationHours: Number(currentDurationHours.toFixed(1)),
        estimatedFee
      };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching active vehicles', error: err.message });
  }
};

exports.processVehicleExit = async (req, res) => {
  try {
    const { vehicleLogId, vehicleNumber } = req.body;

    let log = null;
    if (vehicleLogId) {
      log = await VehicleLog.findById(vehicleLogId);
    } else if (vehicleNumber) {
      log = await VehicleLog.findOne({ vehicleNumber: vehicleNumber.toUpperCase().trim(), status: 'active' });
    }

    if (!log || log.status !== 'active') {
      return res.status(404).json({ message: 'Active vehicle log not found for this exit request' });
    }

    const loc = await Location.findById(log.locationId);
    const rates = loc ? loc.hourlyRates : { twoWheeler: 2, fourWheeler: 5, ev: 7.5, handicap: 4 };

    const exitTime = new Date();
    const feeCalculation = calculateFee(log.entryTime, exitTime, rates, log.vehicleType);

    const updatedLog = await VehicleLog.findByIdAndUpdate(log._id, {
      exitTime,
      durationHours: feeCalculation.billedHours,
      totalFee: feeCalculation.totalFee
    }, { new: true });

    res.json({
      message: `Checkout details generated for vehicle ${log.vehicleNumber}`,
      checkout: {
        logId: log._id,
        vehicleNumber: log.vehicleNumber,
        vehicleType: log.vehicleType,
        slotNumber: log.slotNumber,
        locationName: loc ? loc.name : 'Parking Facility',
        entryTime: log.entryTime,
        exitTime,
        rawHours: feeCalculation.rawHours,
        billedHours: feeCalculation.billedHours,
        ratePerHour: feeCalculation.ratePerHour,
        totalFee: feeCalculation.totalFee,
        paymentStatus: log.paymentStatus
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error processing vehicle exit', error: err.message });
  }
};
