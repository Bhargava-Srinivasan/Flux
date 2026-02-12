import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test('Token Refresh Mechanism', async ({ page }) => {
    // 1. Login
    await page.goto('http://localhost:3000/login');
    await page.fill("input[name='email']", 'test@demo.com');
    await page.fill("input[name='password']", 'password123');
    await page.click("button:has-text('Login')");

    // 2. Wait for Dashboard
    await expect(page.locator("[data-testid='org-list']")).toBeVisible();

    // 3. Simulate Access Token Expiry
    // We can't easily modify the cookie/localStorage httpOnly cookie if it was httpOnly,
    // but here we use zustand persist.
    // Let's manually corrupt the accessToken in localStorage to simulate expiry/invalidity,
    // forcing the interceptor to use the refresh token.

    // BUT our interceptor logic relies on 401 from backend.
    // If we change token to "invalid", backend returns 401.

    await page.evaluate(() => {
      const storage = localStorage.getItem('auth-storage');
      if (storage) {
        const parsed = JSON.parse(storage);
        parsed.state.accessToken = 'invalid-token';
        localStorage.setItem('auth-storage', JSON.stringify(parsed));
      }
    });

    // 4. Trigger an API call (e.g. refresh list)
    // Reload page or navigate
    await page.reload();

    // 5. Expect to stay logged in (because refresh token works)
    await expect(page.locator("[data-testid='org-list']")).toBeVisible();

    // 6. Simulate Refresh Token Expiry (Both invalid)
    await page.evaluate(() => {
      const storage = localStorage.getItem('auth-storage');
      if (storage) {
        const parsed = JSON.parse(storage);
        parsed.state.accessToken = 'invalid-token';
        parsed.state.refreshToken = 'invalid-refresh-token';
        localStorage.setItem('auth-storage', JSON.stringify(parsed));
      }
    });

    // 7. Trigger API call
    await page.reload();

    // 8. Expect redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});
