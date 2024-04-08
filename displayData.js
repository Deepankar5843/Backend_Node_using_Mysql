const connection = require("./db");

// Function to fetch and display data from the loan table
function displayLoanData(callback) {
  const query = "SELECT * FROM loan";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching data from loan table: " + err.message);
      if (callback) {
        callback(err);
      }
    } else {
      console.log("Loan data fetched successfully:");
      console.log(results);
      if (callback) {
        callback(null, results);
      }
    }
  });
}

// Function to fetch and display data from the customer table
function displayCustomerData(callback) {
  const query = "SELECT * FROM customer";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching data from customer table: " + err.message);
      if (callback) {
        callback(err);
      }
    } else {
      console.log("Customer data fetched successfully:");
      console.log(results);
      if (callback) {
        callback(null, results);
      }
    }
  });
}

// Export the functions
module.exports = { displayLoanData, displayCustomerData };
