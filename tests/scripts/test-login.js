import axios from 'axios';

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:5001/api/v1/auth/login', {
      email: 'admin@thestackly.com',
      password: 'StacklyWFA2026!'
    });
    console.log(res.data);
  } catch (err) {
    if (err.response) {
      console.error(err.response.data);
    } else {
      console.error(err.message);
    }
  }
}

testLogin();
