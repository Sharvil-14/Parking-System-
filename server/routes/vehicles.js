const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/entry', authMiddleware, roleMiddleware('Admin', 'Operator'), vehicleController.registerVehicleEntry);
router.get('/active', authMiddleware, vehicleController.getActiveVehicles);
router.post('/exit', authMiddleware, roleMiddleware('Admin', 'Operator'), vehicleController.processVehicleExit);

module.exports = router;
