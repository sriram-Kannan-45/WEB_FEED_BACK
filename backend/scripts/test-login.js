const http = require('http');

const testLogin = async () => {
  const postData = JSON.stringify({
    email: 'sriram@gmail.com',
    password: '123'
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length
    }
  };

  console.log('\n🧪 TESTING LOGIN:\n');
  console.log(`Email: sriram@gmail.com`);
  console.log(`Password: 123\n`);

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Response:\n`);
      try {
        const parsed = JSON.parse(data);
        console.log(JSON.stringify(parsed, null, 2));
        
        if (res.statusCode === 200) {
          console.log(`\n✅ LOGIN SUCCESS!`);
          if (parsed.token) {
            console.log(`Token: ${parsed.token.substring(0, 50)}...`);
          }
        } else {
          console.log(`\n❌ LOGIN FAILED`);
        }
      } catch (e) {
        console.log(data);
      }
      process.exit(0);
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });

  req.write(postData);
  req.end();
};

// Give server a moment to be ready
setTimeout(testLogin, 1000);
