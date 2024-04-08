
const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'sql6.freesqldatabase.com', 
  user: 'sql6696397', 
  password: 'DGuX4zCRsx', 
  database: 'sql6696397' 
});

const registerCustomer = (req, res) => {
  try {
      const { first_name, last_name, age, monthly_income, phone_number } = req.body;

      const approved_limit = Math.round(36 * monthly_income / 100000) * 100000; 

      const sql = "INSERT INTO customer (FirstName, LastName, Age, MonthlySalary, PhoneNumber, ApprovedLimit, CurrentDebt) VALUES (?, ?, ?, ?, ?, ?, ?)";
      const values = [first_name, last_name, age, monthly_income, approved_limit, phone_number, 0]; 
      db.query(sql, values, (err, result) => {
          if (err) {
              throw err;
          }

          const customer_id = result.insertId;

         
          const response_body = {
              customer_id: customer_id,
              name: `${first_name} ${last_name}`,
              age: age,
              monthly_income: monthly_income,
              approved_limit: approved_limit,
              phone_number: phone_number
          };

          res.status(200).json(response_body);
      });
  } catch (err) {
      res.status(400).json({ error: err.message });
  }
};


module.exports = { registerCustomer };
