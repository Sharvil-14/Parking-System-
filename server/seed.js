const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Location = require('./models/Location');
const Slot = require('./models/Slot');
const VehicleLog = require('./models/VehicleLog');
const Transaction = require('./models/Transaction');

const seedDatabase = async () => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('[Seed] Database already seeded. Skipping.');
      return;
    }

    console.log('[Seed] Seeding VPMS database with sample data...');

    // 1. Create Default Users
    const hashedAdmin = await bcrypt.hash('admin123', 10);
    const hashedOperator = await bcrypt.hash('operator123', 10);
    const hashedCustomer = await bcrypt.hash('customer123', 10);

    const admin = await User.create({
      name: 'Sarah Connor (Admin)',
      email: 'admin@vpms.com',
      password: hashedAdmin,
      role: 'Admin',
      phone: '+1 555-0192',
      vehicleNumber: 'ADMIN-01'
    });

    const operator = await User.create({
      name: 'John Miller (Operator)',
      email: 'operator@vpms.com',
      password: hashedOperator,
      role: 'Operator',
      phone: '+1 555-0188',
      vehicleNumber: 'OP-101'
    });

    const customer = await User.create({
      name: 'Alex Rivera (Customer)',
      email: 'customer@vpms.com',
      password: hashedCustomer,
      role: 'Customer',
      phone: '+1 555-0144',
      vehicleNumber: 'CA-7X99'
    });

    // 2. Create Parking Locations
    const loc1 = await Location.create({
      name: 'Metro Central Parking Hub',
      address: '750 Market Street, San Francisco, CA 94102',
      city: 'San Francisco',
      lat: 37.7850,
      lng: -122.4065,
      totalSlots: 24,
      hourlyRates: { twoWheeler: 2.50, fourWheeler: 6.00, ev: 8.50, handicap: 4.50 },
      operatingHours: '24/7 Open',
      image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80'
    });

    const loc2 = await Location.create({
      name: 'Downtown Plaza Underground',
      address: '333 Post Street, San Francisco, CA 94108',
      city: 'San Francisco',
      lat: 37.7885,
      lng: -122.4078,
      totalSlots: 20,
      hourlyRates: { twoWheeler: 2.00, fourWheeler: 5.00, ev: 7.00, handicap: 4.00 },
      operatingHours: '06:00 AM - 12:00 AM',
      image: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=600&q=80'
    });

    const loc3 = await Location.create({
      name: 'Waterfront EV & Eco Plaza',
      address: 'Pier 1, The Embarcadero, San Francisco, CA 94111',
      city: 'San Francisco',
      lat: 37.7960,
      lng: -122.3940,
      totalSlots: 16,
      hourlyRates: { twoWheeler: 3.00, fourWheeler: 7.00, ev: 9.00, handicap: 5.00 },
      operatingHours: '24/7 Open',
      image: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=600&q=80'
    });

    const loc4 = await Location.create({
      name: 'Westside Mall Garage',
      address: '3251 20th Avenue, San Francisco, CA 94132',
      city: 'San Francisco',
      lat: 37.7285,
      lng: -122.4770,
      totalSlots: 30,
      hourlyRates: { twoWheeler: 1.50, fourWheeler: 4.00, ev: 6.00, handicap: 3.00 },
      operatingHours: '08:00 AM - 10:00 PM',
      image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80'
    });

    const sampleLocations = [loc1, loc2, loc3, loc4];

    // 3. Populate Floor Slots for Locations
    const slotTypes = ['4-wheeler', '4-wheeler', '2-wheeler', 'EV', 'handicap'];
    const floors = ['Ground Floor', 'Floor 1', 'Floor 2'];

    let slotCounter = 1;

    for (const loc of sampleLocations) {
      const slotCount = loc.totalSlots || 20;
      for (let i = 1; i <= slotCount; i++) {
        const floor = floors[(i - 1) % floors.length];
        const type = slotTypes[(i - 1) % slotTypes.length];
        const prefix = floor === 'Ground Floor' ? 'G' : floor === 'Floor 1' ? 'F1' : 'F2';
        const slotNumber = `${prefix}-${100 + i}`;

        // Initial mix: 65% available, 25% occupied, 10% reserved
        let status = 'available';
        let occupiedBy = '';
        let reservedBy = '';

        if (i % 4 === 0) {
          status = 'occupied';
          occupiedBy = `CAL-${100 + slotCounter}`;
        } else if (i % 7 === 0) {
          status = 'reserved';
          reservedBy = 'Alex Rivera';
        }

        const slotDoc = await Slot.create({
          locationId: loc._id,
          slotNumber,
          floor,
          type,
          status,
          occupiedByVehicle: occupiedBy,
          reservedByCustomer: reservedBy
        });

        // 4. Create Active Vehicle Log if occupied
        if (status === 'occupied') {
          const hoursAgo = Math.floor(Math.random() * 5) + 1;
          const entryTime = new Date(Date.now() - hoursAgo * 3600 * 1000);

          await VehicleLog.create({
            vehicleNumber: occupiedBy,
            vehicleType: type,
            ownerName: `Driver ${slotCounter}`,
            ownerPhone: `+1 555-0${100 + slotCounter}`,
            locationId: loc._id,
            slotId: slotDoc._id,
            slotNumber,
            entryTime,
            status: 'active',
            paymentStatus: 'pending'
          });
        }

        slotCounter++;
      }
    }

    // 5. Seed Historical Completed Transactions
    const completedSampleVehicles = [
      { vNo: 'SF-8899', type: '4-wheeler', fee: 18.00, method: 'card', hours: 3 },
      { vNo: 'EV-3312', type: 'EV', fee: 25.50, method: 'stripe', hours: 3 },
      { vNo: 'MOTO-44', type: '2-wheeler', fee: 7.50, method: 'upi', hours: 3 },
      { vNo: 'HCP-0099', type: 'handicap', fee: 13.50, method: 'cash', hours: 3 },
      { vNo: 'BAY-1020', type: '4-wheeler', fee: 24.00, method: 'razorpay', hours: 4 }
    ];

    for (const item of completedSampleVehicles) {
      const entryTime = new Date(Date.now() - (item.hours + 2) * 3600 * 1000);
      const exitTime = new Date(Date.now() - 2 * 3600 * 1000);

      const vLog = await VehicleLog.create({
        vehicleNumber: item.vNo,
        vehicleType: item.type,
        ownerName: 'Prior Guest',
        locationId: loc1._id,
        slotId: 'historical_slot',
        slotNumber: 'G-101',
        entryTime,
        exitTime,
        status: 'completed',
        durationHours: item.hours,
        totalFee: item.fee,
        paymentStatus: 'paid'
      });

      await Transaction.create({
        transactionId: 'TXN_' + Date.now() + '_' + Math.floor(1000 + Math.random() * 9000),
        logId: vLog._id,
        vehicleNumber: item.vNo,
        locationId: loc1._id,
        amount: item.fee,
        paymentMethod: item.method,
        paymentGateway: item.method === 'stripe' ? 'Stripe Gateway' : item.method === 'razorpay' ? 'Razorpay Gateway' : 'Standard Payment',
        status: 'success',
        paidAt: exitTime
      });
    }

    console.log('[Seed] Database seeding completed successfully!');
    console.log('----------------------------------------------------');
    console.log('Default Credentials:');
    console.log('Admin:    admin@vpms.com    / admin123');
    console.log('Operator: operator@vpms.com / operator123');
    console.log('Customer: customer@vpms.com / customer123');
    console.log('----------------------------------------------------');
  } catch (err) {
    console.error('[Seed Error]', err);
  }
};

module.exports = seedDatabase;
