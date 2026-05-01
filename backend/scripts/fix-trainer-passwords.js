const bcrypt = require('bcryptjs');
const { sequelize } = require('../src/config/db');
const { User } = require('../src/models');

const fixTrainerPasswords = async () => {
  try {
    const password = '123';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('\n🔧 FIXING TRAINER PASSWORDS:\n');
    console.log(`Original password: ${password}`);
    console.log(`New hash: ${hashedPassword}\n`);

    // Update sriram@gmail.com
    const result = await User.update(
      { password: hashedPassword },
      { where: { email: 'sriram@gmail.com', role: 'TRAINER' } }
    );

    console.log(`✅ Updated sriram@gmail.com: ${result[0]} row(s) affected`);

    // Verify the update
    const trainer = await User.findOne({
      where: { email: 'sriram@gmail.com' },
      attributes: ['email', 'password'],
      raw: true
    });

    if (trainer) {
      console.log(`\n✅ Verification:`);
      console.log(`   Email: ${trainer.email}`);
      console.log(`   Password hash: ${trainer.password.substring(0, 30)}...`);
      
      // Test bcrypt.compare
      const isMatch = await bcrypt.compare(password, trainer.password);
      console.log(`   bcrypt.compare("123", hash): ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

fixTrainerPasswords();
