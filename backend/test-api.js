/**
 * Quick API test — validates all endpoints work against live DB
 */
const http = require('http');

const BASE = 'http://localhost:5000';
let testCookie = '';

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...(testCookie ? { Cookie: testCookie } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        // Capture cookie
        const setCookie = res.headers['set-cookie'];
        if (setCookie) {
          testCookie = setCookie[0].split(';')[0];
        }
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('\n  ╔═══════════════════════════════════╗');
  console.log('  ║  RoeBook API — Live Endpoint Tests ║');
  console.log('  ╚═══════════════════════════════════╝\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅  ${name}`);
      passed++;
    } catch (err) {
      console.log(`  ❌  ${name}`);
      console.log(`      └─ ${err.message}`);
      failed++;
    }
  }

  function assert(condition, msg) {
    if (!condition) throw new Error(msg);
  }

  // 1. Health check
  await test('GET / — Health check', async () => {
    const res = await request('GET', '/');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.success === true, 'Expected success:true');
    assert(res.body.message === 'RoeBook API is running', 'Unexpected message');
  });

  // 2. Get products (empty initially)
  await test('GET /api/products — List products', async () => {
    const res = await request('GET', '/api/products');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.success === true, 'Expected success:true');
    assert(Array.isArray(res.body.data), 'data should be an array');
    assert(res.body.pagination, 'Should have pagination');
  });

  // 3. Register a user
  const testEmail = `test_${Date.now()}@roebook.com`;
  await test('POST /api/auth/register — Register user', async () => {
    const res = await request('POST', '/api/auth/register', {
      fullName: 'Test User',
      email: testEmail,
      password: 'Test123456',
    });
    assert(res.status === 201, `Expected 201, got ${res.status}: ${JSON.stringify(res.body)}`);
    assert(res.body.success === true, 'Expected success:true');
    assert(res.body.data.email === testEmail, 'Email should match');
    assert(res.body.data.role === 'user', 'Default role should be user');
  });

  // 4. Login
  await test('POST /api/auth/login — Login user', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: testEmail,
      password: 'Test123456',
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.success === true, 'Expected success:true');
    assert(testCookie.includes('jwt='), 'Should receive jwt cookie');
  });

  // 5. Get profile (authenticated)
  await test('GET /api/auth/profile — Get profile (protected)', async () => {
    const res = await request('GET', '/api/auth/profile');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.success === true, 'Expected success:true');
    assert(res.body.data.email === testEmail, 'Email should match');
  });

  // 6. Update profile
  await test('PUT /api/auth/profile — Update profile', async () => {
    const res = await request('PUT', '/api/auth/profile', {
      fullName: 'Updated User',
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.fullName === 'Updated User', 'Name should be updated');
  });

  // 7. Get products with filters
  await test('GET /api/products?category=men — Filter by category', async () => {
    const res = await request('GET', '/api/products?category=men');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.body.data), 'data should be an array');
  });

  // 8. 404 handler
  await test('GET /api/nonexistent — 404 handler', async () => {
    const res = await request('GET', '/api/nonexistent');
    assert(res.status === 404, `Expected 404, got ${res.status}`);
    assert(res.body.success === false, 'Expected success:false');
  });

  // 9. Protected route without auth
  const savedCookie = testCookie;
  testCookie = '';
  await test('GET /api/auth/profile — 401 without auth', async () => {
    const res = await request('GET', '/api/auth/profile');
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });
  testCookie = savedCookie;

  // 10. Logout
  await test('POST /api/auth/logout — Logout', async () => {
    const res = await request('POST', '/api/auth/logout');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.success === true, 'Expected success:true');
  });

  // Summary
  console.log(`\n  ────────────────────────────────────`);
  console.log(`  Total: ${passed + failed}  |  ✅ Passed: ${passed}  |  ❌ Failed: ${failed}`);
  console.log(`  ────────────────────────────────────\n`);

  if (failed > 0) {
    console.log('  ⚠️  Some tests failed!\n');
    process.exit(1);
  } else {
    console.log('  🎉 All API tests passed! Backend is fully operational.\n');
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Test runner failed:', err.message);
  process.exit(1);
});
