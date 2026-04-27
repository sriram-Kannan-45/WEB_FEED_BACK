const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDB() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'training_db'
  });

  console.log('=== DB CHECK ===');
  console.log('Users:', (await connection.query('SELECT id, email, role FROM users')).[0].length);
  console.log('Trainings:', (await connection.query('SELECT id, title FROM trainings')).[0].length);
  console.log('Trainers:', (await connection.query("SELECT id, email FROM users WHERE role='TRAINER'")).[0].length);
  
  await connection.end();
}

testDB().catch(console.error);