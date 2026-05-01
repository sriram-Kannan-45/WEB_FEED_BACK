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
  const [users] = await connection.query('SELECT id, email, role FROM users');
  console.log('Users:', users.length);
  
  const [trainings] = await connection.query('SELECT id, title, trainer_id FROM trainings');
  console.log('Trainings:', trainings.length);
  trainings.forEach(t => console.log('  - ID:', t.id, '| Title:', t.title, '| TrainerID:', t.trainer_id));
  
  await connection.end();
}

testDB().catch(console.error);