const Slot = require('../models/Slot');
const Location = require('../models/Location');

exports.getSlotsByLocation = async (req, res) => {
  try {
    const { locationId } = req.params;
    const { floor, type, status } = req.query;

    const filter = { locationId };
    if (floor) filter.floor = floor;
    if (type) filter.type = type;
    if (status) filter.status = status;

    const slots = await Slot.find(filter);
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching slots', error: err.message });
  }
};

exports.createSlot = async (req, res) => {
  try {
    const { locationId, slotNumber, floor = 'Ground', type = '4-wheeler', status = 'available' } = req.body;
    if (!locationId || !slotNumber) {
      return res.status(400).json({ message: 'locationId and slotNumber are required' });
    }

    const existing = await Slot.findOne({ locationId, slotNumber });
    if (existing) {
      return res.status(400).json({ message: `Slot ${slotNumber} already exists at this location` });
    }

    const newSlot = await Slot.create({
      locationId,
      slotNumber,
      floor,
      type,
      status
    });

    res.status(201).json(newSlot);
  } catch (err) {
    res.status(500).json({ message: 'Error creating slot', error: err.message });
  }
};

exports.updateSlotStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, occupiedByVehicle, reservedByCustomer } = req.body;

    const slot = await Slot.findById(id);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (occupiedByVehicle !== undefined) updateData.occupiedByVehicle = occupiedByVehicle;
    if (reservedByCustomer !== undefined) updateData.reservedByCustomer = reservedByCustomer;

    const updated = await Slot.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating slot status', error: err.message });
  }
};

exports.reserveSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const customerName = req.user ? req.user.name : (req.body.customerName || 'Customer');

    const slot = await Slot.findById(id);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    if (slot.status !== 'available') {
      return res.status(400).json({ message: `Slot ${slot.slotNumber} is currently ${slot.status}` });
    }

    const updated = await Slot.findByIdAndUpdate(id, {
      status: 'reserved',
      reservedByCustomer: customerName,
      reservationTime: new Date().toISOString()
    }, { new: true });

    res.json({ message: `Slot ${slot.slotNumber} reserved successfully`, slot: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error reserving slot', error: err.message });
  }
};

exports.deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Slot.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Slot not found' });
    }
    res.json({ message: 'Slot deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting slot', error: err.message });
  }
};

exports.getReservedSlots = async (req, res) => {
  try {
    const { locationId } = req.query;
    const filter = { status: 'reserved' };
    if (locationId) filter.locationId = locationId;

    const reservedSlots = await Slot.find(filter);
    res.json(reservedSlots);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reserved slots', error: err.message });
  }
};

