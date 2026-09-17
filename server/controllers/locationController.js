const Location = require('../models/Location');
const Slot = require('../models/Slot');

exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    const allSlots = await Slot.find();

    // Enrich locations with live slot occupancy metrics
    const enrichedLocations = locations.map(loc => {
      const locSlots = allSlots.filter(s => String(s.locationId) === String(loc._id));
      const total = locSlots.length || loc.totalSlots || 0;
      const available = locSlots.filter(s => s.status === 'available').length;
      const occupied = locSlots.filter(s => s.status === 'occupied').length;
      const reserved = locSlots.filter(s => s.status === 'reserved').length;

      const breakdown = {
        twoWheeler: locSlots.filter(s => s.type === '2-wheeler' && s.status === 'available').length,
        fourWheeler: locSlots.filter(s => s.type === '4-wheeler' && s.status === 'available').length,
        ev: locSlots.filter(s => s.type === 'EV' && s.status === 'available').length,
        handicap: locSlots.filter(s => s.type === 'handicap' && s.status === 'available').length,
      };

      return {
        ...loc,
        stats: {
          total,
          available,
          occupied,
          reserved,
          occupancyPercentage: total > 0 ? Math.round((occupied / total) * 100) : 0,
          breakdown
        }
      };
    });

    res.json(enrichedLocations);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching parking locations', error: err.message });
  }
};

exports.getLocationById = async (req, res) => {
  try {
    const loc = await Location.findById(req.params.id);
    if (!loc) {
      return res.status(404).json({ message: 'Parking location not found' });
    }
    const locSlots = await Slot.find({ locationId: req.params.id });
    const stats = {
      total: locSlots.length,
      available: locSlots.filter(s => s.status === 'available').length,
      occupied: locSlots.filter(s => s.status === 'occupied').length,
      reserved: locSlots.filter(s => s.status === 'reserved').length
    };
    res.json({ ...loc, stats, slots: locSlots });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching location details', error: err.message });
  }
};

// Geocoding helper fallback for Admin auto-fetch address
const geocodeAddress = (address, lat, lng) => {
  // If coordinates provided, return them; otherwise approximate center offsets
  if (lat && lng) return { lat: Number(lat), lng: Number(lng) };
  // Default fallback center: San Francisco / Metropolitan Area
  return {
    lat: 37.7749 + (Math.random() - 0.5) * 0.05,
    lng: -122.4194 + (Math.random() - 0.5) * 0.05
  };
};

exports.createLocation = async (req, res) => {
  try {
    const { name, address, city, lat, lng, totalSlots = 30, hourlyRates, operatingHours, image } = req.body;
    if (!name || !address) {
      return res.status(400).json({ message: 'Name and address are required' });
    }

    const coords = geocodeAddress(address, lat, lng);

    const newLoc = await Location.create({
      name,
      address,
      city: city || 'Central Metro',
      lat: coords.lat,
      lng: coords.lng,
      totalSlots: Number(totalSlots),
      hourlyRates: hourlyRates || { twoWheeler: 2.00, fourWheeler: 5.00, ev: 7.50, handicap: 4.00 },
      operatingHours: operatingHours || '24/7',
      image: image || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80'
    });

    // Auto generate basic slot layout for newly added location
    const slotTypes = ['2-wheeler', '4-wheeler', 'EV', 'handicap'];
    const floors = ['Ground', 'Floor 1'];

    for (let i = 1; i <= Math.min(Number(totalSlots), 20); i++) {
      const type = slotTypes[(i - 1) % slotTypes.length];
      const floor = floors[(i - 1) % floors.length];
      await Slot.create({
        locationId: newLoc._id,
        slotNumber: `${floor === 'Ground' ? 'G' : 'F1'}-${100 + i}`,
        floor,
        type,
        status: 'available'
      });
    }

    res.status(201).json(newLoc);
  } catch (err) {
    res.status(500).json({ message: 'Error creating parking location', error: err.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const updated = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating location', error: err.message });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    const deleted = await Location.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Location not found' });
    }
    // Delete associated slots
    const locSlots = await Slot.find({ locationId: req.params.id });
    for (const slot of locSlots) {
      await Slot.findByIdAndDelete(slot._id);
    }
    res.json({ message: 'Location and associated slots deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting location', error: err.message });
  }
};
