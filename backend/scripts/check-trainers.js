require('dotenv').config();
const { sequelize } = require('../src/config/db');
const { User } = require('../src/models');

const checkTrainers = async () => {
  try {
    const trainers = await User.findAll({
      where: { role: 'TRAINER' },
      attributes: ['id', 'email', 'password'],
      raw: true
    });

    console.log('\n🔍 TRAINERS IN DATABASE:\n');
    if (trainers.length === 0) {
      console.log('❌ No trainers found in database');
    } else {
      trainers.forEach((t, idx) => {
        console.log(`${idx + 1}. Email: ${t.email}`);
        console.log(`   Password: ${t.password.substring(0, 30)}${t.password.length > 30 ? '...' : ''}`);
        console.log(`   Length: ${t.password.length}`);
        console.log(`   Looks hashed? ${t.password.startsWith('$2') ? '✅ YES' : '❌ NO - PLAIN TEXT'}`);
        console.log();
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkTrainers();
