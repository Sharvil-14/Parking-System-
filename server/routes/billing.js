const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/pay', authMiddleware, billingController.processPayment);
router.get('/transactions', authMiddleware, billingController.getTransactions);

module.exports = router;
