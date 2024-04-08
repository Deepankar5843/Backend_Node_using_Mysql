const db = require('../db'); 


const makeLoanPayment = (req, res) => {
  const customer_id = parseInt(req.params.customer_id);
  const loan_id = parseInt(req.params.loan_id);


  const loanQuery = `SELECT MonthlyPayment, EMIsPaidOnTime FROM loan WHERE CustomerID = ? AND LoanID = ?`;

  db.query(loanQuery, [customer_id, loan_id], (err, loanResult) => {
    if (err) {
      console.error('Error executing query: ' + err.stack);
      res.status(500).send('Internal Server Error');
      return;
    }

    if (loanResult.length === 0) {
      res.status(404).send('Loan not found');
      return;
    }

    const loan = loanResult[0];
    const monthlyPayment = loan.MonthlyPayment;
    const emisPaid = loan.EMIsPaidOnTime;

  
    const payment_amount = parseFloat(req.body.payment_amount);  
    if (payment_amount !== monthlyPayment) {
      res.status(400).send('Invalid payment amount');
      return;
    }

   
    const updatedEMIsPaid = emisPaid + 1;


    const updateQuery = `UPDATE loan SET EMIsPaidOnTime = ? WHERE CustomerID = ? AND LoanID = ?`;
    db.query(updateQuery, [updatedEMIsPaid, customer_id, loan_id], (err, updateResult) => {
      if (err) {
        console.error('Error updating loan details: ' + err.stack);
        res.status(500).send('Internal Server Error');
        return;
      }
      res.status(200).send('Payment successful');
    });
  });
};

module.exports = { makeLoanPayment };
