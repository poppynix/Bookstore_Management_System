// backend/db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',       // Default XAMPP user
  password: '',       // Default XAMPP password is empty
  database: 'bookstore_database' // Must match the name you created in Step 1
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL Database (bookstore_database)');
});

module.exports = db;