const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', locationController.getAllLocations);
router.get('/:id', locationController.getLocationById);
router.post('/', authMiddleware, roleMiddleware('Admin'), locationController.createLocation);
router.put('/:id', authMiddleware, roleMiddleware('Admin'), locationController.updateLocation);
router.delete('/:id', authMiddleware, roleMiddleware('Admin'), locationController.deleteLocation);

module.exports = router;
