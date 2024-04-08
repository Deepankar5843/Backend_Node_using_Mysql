const express = require('express');
const router = express.Router();
const { registerCustomer } = require('../controllers/customerController');

router.post('/register', registerCustomer);
// router.post('/check-eligibility', checkEligibility)

module.exports = router;
