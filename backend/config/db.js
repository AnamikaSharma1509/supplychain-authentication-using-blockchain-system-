const { Pool } = require('pg');
require('dotenv').config();

// Ensure password is a string
const password = String(process.env.DB_PASSWORD);

const pool = new Pool({
  user: process.env.DB_USER,
  password: password,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Test the database connection
pool.connect((err, client, done) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Successfully connected to the database');
    done();
  }
});

module.exports = pool;
