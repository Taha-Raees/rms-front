// Test script to verify JWT authentication with refresh tokens
// Run this in browser console or as a test page

async function runAuthTests() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
  const results = [];

  const logResult = (test, success, details) => {
    results.push({ test, success, details, timestamp: new Date().toISOString() });
    console.log(`[${success ? 'PASS' : 'FAIL'}] ${test}: ${details}`);
  };

  try {
    // Test 1: Initial auth check
    console.log('=== Test 1: Initial Auth Check ===');
    const authResponse = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: 'include'
    });
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      logResult('Auth Check', true, `User: ${authData.data?.email}`);
    } else {
      logResult('Auth Check', false, `Status: ${authResponse.status}`);
    }

    // Test 2: Access protected resource
    console.log('=== Test 2: Protected Resource Access ===');
    const productsResponse = await fetch(`${API_BASE_URL}/products`, {
      credentials: 'include'
    });
    
    if (productsResponse.ok) {
      const productsData = await productsResponse.json();
      logResult('Protected API Access', true, `Products: ${productsData.data?.length || 0}`);
    } else {
      logResult('Protected API Access', false, `Status: ${productsResponse.status}`);
    }

    // Test 3: Token refresh (simulate token expiration)
    console.log('=== Test 3: Token Refresh ===');
    // This will be handled automatically by our API layer, but we can test the refresh endpoint directly
    const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include'
    });
    
    if (refreshResponse.ok) {
      logResult('Token Refresh', true, 'Tokens refreshed successfully');
    } else {
      logResult('Token Refresh', false, `Status: ${refreshResponse.status}`);
    }

    // Test 4: Logout
    console.log('=== Test 4: Logout ===');
    const logoutResponse = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    
    if (logoutResponse.ok) {
      logResult('Logout', true, 'Logged out successfully');
    } else {
      logResult('Logout', false, `Status: ${logoutResponse.status}`);
    }

    // Test 5: Verify logout (should fail)
    console.log('=== Test 5: Verify Logout ===');
    const verifyLogoutResponse = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: 'include'
    });
    
    if (!verifyLogoutResponse.ok) {
      logResult('Verify Logout', true, 'User properly logged out');
    } else {
      logResult('Verify Logout', false, 'User still authenticated after logout');
    }

  } catch (error) {
    console.error('Test failed with error:', error);
    logResult('Overall Test Suite', false, `Error: ${error.message}`);
  }

  console.log('\n=== Test Results Summary ===');
  results.forEach(result => {
    console.log(`${result.timestamp} [${result.success ? 'PASS' : 'FAIL'}] ${result.test}: ${result.details}`);
  });

  const passed = results.filter(r => r.success).length;
  const total = results.length;
  console.log(`\n${passed}/${total} tests passed`);

  return { passed, total, results };
}

// Run the tests
console.log('Starting authentication flow tests...');
runAuthTests().then(results => {
  console.log('Test execution completed');
});
