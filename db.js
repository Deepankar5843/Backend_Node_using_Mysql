const mysql = require('mysql');


const connection = mysql.createConnection({
  host: 'sql6.freesqldatabase.com', 
  user: 'sql6696397', 
  password: 'DGuX4zCRsx', 
  database: 'sql6696397' 
});


connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1); 
  }
  console.log('Connected to MySQL database');
});


module.exports = connection;
