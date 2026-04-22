import { test, expect } from '@playwright/test';

test.describe('User Authentication Flow', () => {
  test('should allow user to sign up and log in via gateway', async ({ request }) => {
    // Use unique email to avoid conflicts
    const uniqueEmail = `test_${Date.now()}@example.com`;
    
    // Test signup endpoint through gateway
    const signupResponse = await request.post('/v1/auth/signup', {
      data: {
        email: uniqueEmail,
        password: 'securepassword123',
        firstName: 'Test',
        lastName: 'User'
      }
    });
    
    expect(signupResponse.ok()).toBeTruthy();
    const signupData = await signupResponse.json();
    expect(signupData.data).toHaveProperty('userId');
    
    // Test login endpoint through gateway
    const loginResponse = await request.post('/v1/auth/login', {
      data: {
        email: uniqueEmail,
        password: 'securepassword123'
      }
    });
    
    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    expect(loginData.data).toHaveProperty('accessToken');
    
    // Test authenticated endpoint through gateway
    const profileResponse = await request.get('/v1/me/profile', {
      headers: {
        Authorization: `Bearer ${loginData.data.accessToken}`
      }
    });
    
    expect(profileResponse.ok()).toBeTruthy();
    const profileData = await profileResponse.json();
    expect(profileData.data).toHaveProperty('email');
    expect(profileData.data.email).toBe(uniqueEmail);
  });
});
