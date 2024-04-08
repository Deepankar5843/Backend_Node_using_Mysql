const express = require('express');
const router = express.Router();
const { viewLoanStatement } = require('../controllers/statementController');
const { makeLoanPayment } = require('../controllers/paymentController');
const { viewLoanDetails } = require('../controllers/loanController');
const loanController = require('../controllers/loanController');
const { createLoan } = require('../controllers/loanController');

router.post('/create-loan', createLoan);

// Route to check loan eligibility
router.post('/check-eligible', (req, res) => {
  const { customer_id, loan_amount, interest_rate, tenure } = req.body;

  loanController.checkLoanEligibility(customer_id, loan_amount, interest_rate, tenure, (err, result) => {
    if (err) {
      console.error('Error processing loan:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    res.json(result);
  });
});


router.get('/view-loan/:loan_id', viewLoanDetails);

router.post('/make-payment/:customer_id/:loan_id', makeLoanPayment);

router.get('/view-statement/:customer_id/:loan_id', viewLoanStatement);

module.exports = router;
