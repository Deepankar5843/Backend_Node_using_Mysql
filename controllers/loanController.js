
const db = require('../db');


function calculateCreditScore(loanHistory) {
  let creditScore = 0;


  const paidOnTimeWeight = 0.3;
  const numberOfLoansWeight = 0.2;
  const loanActivityWeight = 0.2;
  const loanApprovedVolumeWeight = 0.3;

  
  const paidOnTimeScore = calculatePaidOnTimeScore(loanHistory);
  const numberOfLoansScore = calculateNumberOfLoansScore(loanHistory);
  const loanActivityScore = calculateLoanActivityScore(loanHistory);
  const loanApprovedVolumeScore = calculateLoanApprovedVolumeScore(loanHistory);

  
  creditScore = (
    paidOnTimeScore * paidOnTimeWeight +
    numberOfLoansScore * numberOfLoansWeight +
    loanActivityScore * loanActivityWeight +
    loanApprovedVolumeScore * loanApprovedVolumeWeight
  );


  creditScore = Math.round(creditScore);

 
  if (creditScore < 0) {
    creditScore = 0;
  }

  return creditScore;
}


function calculatePaidOnTimeScore(loanHistory) {
  const onTimePayments = loanHistory.reduce((count, loan) => {
    return count + (loan.emis_paid_on_time >= loan.tenure ? 1 : 0);
  }, 0);


  const percentage = onTimePayments / loanHistory.length;
  if (percentage >= 0.8) {
    return 100;
  } else if (percentage >= 0.6) {
    return 80;
  } else if (percentage >= 0.4) {
    return 60;
  } else if (percentage >= 0.2) {
    return 40;
  } else {
    return 20;
  }
}


function calculateNumberOfLoansScore(loanHistory) {
  const numberOfLoans = loanHistory.length;


  if (numberOfLoans === 0) {
    return 100;
  } else if (numberOfLoans === 1) {
    return 80;
  } else if (numberOfLoans === 2) {
    return 60;
  } else if (numberOfLoans === 3) {
    return 40;
  } else {
    return 20;
  }
}


function calculateLoanActivityScore(loanHistory) {
  const currentYear = new Date().getFullYear();
  const currentYearLoans = loanHistory.filter(loan => new Date(loan.date_of_approval).getFullYear() === currentYear);


  const loanCount = currentYearLoans.length;
  if (loanCount === 0) {
    return 100;
  } else if (loanCount === 1) {
    return 80;
  } else if (loanCount === 2) {
    return 60;
  } else if (loanCount === 3) {
    return 40;
  } else {
    return 20;
  }
}


function calculateLoanApprovedVolumeScore(loanHistory) {
  const totalApprovedVolume = loanHistory.reduce((total, loan) => total + loan.loan_amount, 0);

 
  if (totalApprovedVolume >= 1000000) {
    return 100;
  } else if (totalApprovedVolume >= 500000) {
    return 80;
  } else if (totalApprovedVolume >= 200000) {
    return 60;
  } else if (totalApprovedVolume >= 100000) {
    return 40;
  } else {
    return 20;
  }
}



function checkLoanEligibility(customer_id, loan_amount, interest_rate, tenure, callback) {

  const loanHistoryQuery = `SELECT * FROM loan WHERE CustomerID = ${customer_id}`;
  const customerHistoryQuery = `SELECT MonthlySalary FROM customer WHERE CustomerID = ${customer_id}`;

 
  db.query(loanHistoryQuery, (err, rows) => {
    if (err) {
      console.error('Error fetching loan history:', err);
      callback(err);
      return;
    }

    if (rows.length === 0) {
      
      console.log('Customer ID not found in loan table');
      callback({ message: 'Customer Id not found in loan table' });
      return;
    }

   
    db.query(customerHistoryQuery, (err, customerRows) => {
      if (err) {
        console.error('Error fetching customer details:', err);
        callback(err);
        return;
      }

      if (customerRows.length === 0) {
        
        console.log('Customer ID not found in customer table');
        callback({ message: 'Customer Id not found in customer table' });
        return;
      }

      const monthlySalary = customerRows[0].MonthlySalary;

  
      const creditScore = calculateCreditScore(rows);

     
      const sumCurrentEMIs = rows.reduce((total, row) => total + row.MonthlyPayment, 0);
      const maxEMIAllowed = monthlySalary * 0.5;
      if (sumCurrentEMIs > maxEMIAllowed) {
        callback(null, { customer_id, approval: false, message: 'Sum of current EMIs exceeds 50% of monthly salary' });
        return;
      }

     
      let approved = false;
      let correctedInterestRate = interest_rate;
      let monthly_installment = 0;
      let calculatedTenure = 0;

      if (creditScore > 50) {
        approved = true;
      } else if (50 > creditScore && creditScore > 30) {
        if (interest_rate <= 12) {
          correctedInterestRate = 12;
        }
        approved = true;
      } else if (30 > creditScore && creditScore > 10) {
        if (interest_rate <= 16) {
          correctedInterestRate = 16;
        }
        approved = true;
      }

      if (approved) {
      
        const monthlyInterestRate = correctedInterestRate / 12 / 100;
        const totalPayments = loan_amount / monthlySalary * 2;
        calculatedTenure = Math.ceil(totalPayments);
        monthly_installment = (loan_amount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -calculatedTenure));
      }

     
      const result = {
        customer_id,
        approval: approved,
        interest_rate: interest_rate,
        corrected_interest_rate: correctedInterestRate,
        tenure: calculatedTenure,
        monthly_installment: monthly_installment
      };

      callback(null, result);
    });
  });
}





function createLoan(req, res) {
  const { customer_id, loan_amount, interest_rate, tenure } = req.body;

  checkLoanEligibility(customer_id, loan_amount, interest_rate, tenure, (err, result) => {
    if (err) {
      console.error('Error processing loan:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    storeLoanResponse(result, (err) => {
      if (err) {
        console.error('Error storing loan response:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      res.json(result);
    });
  });
}

function checkLoanEligibility(customer_id, loan_amount, interest_rate, tenure, callback) {
  
  function generateLoanID() {
    
    return Math.floor(1000 + Math.random() * 9000);
  }

  
  const loan_id = generateLoanID(); 
  const loan_approved = true;
  const message = loan_approved ? 'Loan approved' : 'Loan not approved';
  const monthly_installment = 500; 

  const result = {
    loan_id,
    customer_id,
    loan_approved,
    message,
    monthly_installment
  };

  callback(null, result);
}

function storeLoanResponse(response, callback) {
  const { loan_id, customer_id, loan_approved, message, monthly_installment } = response;

  
  const createTableQuery = `CREATE TABLE IF NOT EXISTS new_loan (
    loan_id INT PRIMARY KEY,
    customer_id INT,
    loan_approved BOOLEAN,
    message VARCHAR(255),
    monthly_installment FLOAT
  )`;

  db.query(createTableQuery, (err) => {
    if (err) {
      callback(err);
      return;
    }

  
    const insertQuery = `INSERT INTO new_loan (loan_id, customer_id, loan_approved, message, monthly_installment)
                        VALUES (?, ?, ?, ?, ?)`;
    const values = [loan_id, customer_id, loan_approved, message, monthly_installment];

    db.query(insertQuery, values, (err) => {
      if (err) {
        callback(err);
        return;
      }

      callback(null);
    });
  });
}




const viewLoanDetails = (req, res) => {
  const loan_id = parseInt(req.params.loan_id); 

  const loanQuery = `SELECT CustomerID, LoanAmount, Tenure, InterestRate, MonthlyPayment FROM loan WHERE LoanID = ?`;
  const customerQuery = `SELECT FirstName, LastName, Age, PhoneNumber FROM customer WHERE CustomerID = (SELECT CustomerID FROM loan WHERE LoanID = ?)`;

  Promise.all([
    new Promise((resolve, reject) => {
      db.query(loanQuery, [loan_id], (err, results) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(results[0]);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(customerQuery, [loan_id], (err, results) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(results[0]);
      });
    })
  ])
  .then(([loanDetails, customerDetails]) => {
    if (!loanDetails || !customerDetails) {
      res.status(404).send('Loan or customer not found');
      return;
    }
    
    const data = {
      loanDetails: {
        loan_id: loan_id,
        loan_amount: loanDetails.LoanAmount,
        interest_rate: loanDetails.InterestRate,
        monthly_payment: loanDetails.MonthlyPayment,
        tenure: loanDetails.Tenure
      },
      customerDetails: {
        customer_id: loanDetails.CustomerID,
        first_name: customerDetails.FirstName,
        last_name: customerDetails.LastName,
        age: customerDetails.Age,
        phone_number: customerDetails.PhoneNumber
      }
    };
    res.json(data);
  })
  .catch(err => {
    console.error('Error executing queries: ' + err.stack);
    res.status(500).send('Internal Server Error');
  });
};


module.exports = {
  calculateCreditScore, viewLoanDetails, checkLoanEligibility, createLoan
};
