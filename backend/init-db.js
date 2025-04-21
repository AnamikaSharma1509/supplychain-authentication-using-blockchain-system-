const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Ensure password is a string
const password = String(process.env.DB_PASSWORD);

// Create a connection to the default postgres database
const pool = new Pool({
  user: process.env.DB_USER,
  password: password,
  host: process.env.DB_HOST,
  database: 'postgres', // Connect to default postgres database
  port: process.env.DB_PORT,
});

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    // Check if database exists
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME]
    );
    
    // Create database if it doesn't exist
    if (result.rows.length === 0) {
      console.log(`Creating database ${process.env.DB_NAME}...`);
      await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(`Database ${process.env.DB_NAME} created successfully.`);
    } else {
      console.log(`Database ${process.env.DB_NAME} already exists.`);
    }
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    client.release();
  }
  
  // Close the pool
  await pool.end();
  
  // Now connect to the newly created database
  const dbPool = new Pool({
    user: process.env.DB_USER,
    password: password,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });
  
  const dbClient = await dbPool.connect();
  
  try {
    // Read and execute the schema file
    const schemaPath = path.join(__dirname, 'config', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Creating tables...');
    await dbClient.query(schema);
    console.log('Tables created successfully.');
  } catch (err) {
    console.error('Error creating tables:', err);
  } finally {
    dbClient.release();
    await dbPool.end();
  }
}

// Run the initialization
initializeDatabase().catch(console.error); 