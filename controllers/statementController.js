const db = require('../db'); 

const viewLoanStatement = (req, res) => {
  const customer_id = parseInt(req.params.customer_id);
  const loan_id = parseInt(req.params.loan_id);

 
  const loanQuery = `SELECT CustomerID, LoanID, LoanAmount, InterestRate, MonthlyPayment, EMIsPaidOnTime, Tenure FROM loan WHERE CustomerID = ? AND LoanID = ?`;


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
    const principal = loan.LoanAmount;
    const interest_rate = loan.InterestRate;
    const monthly_installment = loan.MonthlyPayment;
    const repayments_left = loan.Tenure - loan.EMIsPaidOnTime;
    const amount_paid = (loan.EMIsPaidOnTime * monthly_installment);

   
    const statement = {
      customer_id: loan.CustomerID,
      loan_id: loan.LoanID,
      principal: principal,
      interest_rate: interest_rate,
      amount_paid: amount_paid,
      monthly_installment: monthly_installment,
      repayments_left: repayments_left
    };

    res.json(statement);
  });
};

module.exports = { viewLoanStatement };
