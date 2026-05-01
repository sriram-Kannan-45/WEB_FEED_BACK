const bcrypt = require('bcryptjs');

const testBcrypt = async () => {
  try {
    // These are the actual hashes from the database for sriram@gmail.com
    const storedHash1 = '$2a$10$1AtstmWMdmqhPLwZ2XUO1.oDLKQhTYPkkm2QdGRlQ4tXjjvVFUdP2';  // titooramn123
    const storedHash2 = '$2a$10$8brGDrBwUxddL6hbgrBaC.Y7W2jRjbW97o.Y6hqXJOXrDQQArH2W';  // sriram@gmail.com

    const password = '123';

    console.log('\n🔍 TESTING BCRYPT.COMPARE:\n');
    
    console.log('Test 1: Comparing "123" with first hash');
    const result1 = await bcrypt.compare(password, storedHash1);
    console.log(`Result: ${result1 ? '✅ MATCH' : '❌ NO MATCH'}\n`);

    console.log('Test 2: Comparing "123" with second hash (sriram)');
    const result2 = await bcrypt.compare(password, storedHash2);
    console.log(`Result: ${result2 ? '✅ MATCH' : '❌ NO MATCH'}\n`);

    // Also test if these hashes were created from "123"
    console.log('Test 3: Creating a fresh hash from "123" and comparing');
    const freshHash = await bcrypt.hash(password, 10);
    console.log(`Fresh hash: ${freshHash}`);
    const result3 = await bcrypt.compare(password, freshHash);
    console.log(`Comparing "123" with fresh hash: ${result3 ? '✅ MATCH' : '❌ NO MATCH'}\n`);

    // Let me also check if the problem is with the hash format
    console.log('Test 4: Checking hash format');
    console.log(`Hash 1 starts with: ${storedHash1.substring(0, 4)}`);
    console.log(`Hash 2 starts with: ${storedHash2.substring(0, 4)}`);
    console.log(`Fresh hash starts with: ${freshHash.substring(0, 4)}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

testBcrypt();
