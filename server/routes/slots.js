const express = require('express');
const router = express.Router();
const slotController = require('../controllers/slotController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/location/:locationId', slotController.getSlotsByLocation);
router.get('/reserved', authMiddleware, roleMiddleware('Admin', 'Operator'), slotController.getReservedSlots);
router.post('/', authMiddleware, roleMiddleware('Admin', 'Operator'), slotController.createSlot);
router.patch('/:id/status', authMiddleware, roleMiddleware('Admin', 'Operator'), slotController.updateSlotStatus);
router.post('/:id/reserve', authMiddleware, slotController.reserveSlot);
router.delete('/:id', authMiddleware, roleMiddleware('Admin'), slotController.deleteSlot);

module.exports = router;

