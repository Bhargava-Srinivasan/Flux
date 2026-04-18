import { test, expect } from '@playwright/test';

test.describe('E2E Dashboard Flow', () => {
  // We assume the servers are running and data is seeded.
  // In a real CI pipeline, we would handle startup/teardown here.

  test('Complete Flow: Login -> Org -> Workspace', async ({ page }) => {
    // 1. Login
    await page.goto('http://localhost:3000/login');
    await page.fill("input[name='email']", 'test@demo.com');
    await page.fill("input[name='password']", 'password123');
    await page.click("button:has-text('Login')");

    // 2. Dashboard (Org List)
    await expect(page.locator("[data-testid='org-list']")).toBeVisible();

    // Check if seeded org exists or create one
    // We can't rely on state persistence across runs perfectly in dev, but seed ensures it.
    if (await page.isVisible('text=Test Org E2E')) {
      await page.click('text=Test Org E2E');
    } else {
      // Create Org
      await page.click("[data-testid='create-org-btn'] button");
      await page.fill("input[name='name']", 'Test Org E2E Created');
      await page.fill("input[name='slug']", 'test-org-e2e-created');
      await page.click("button:has-text('Create')");
      await page.click('text=Test Org E2E Created');
    }

    // 3. Workspace List
    await expect(page.locator("[data-testid='workspace-list']")).toBeVisible();

    // Check seeded workspace
    if (await page.isVisible('text=Test Workspace E2E')) {
      // success
    } else {
      // Create Workspace
      await page.click("[data-testid='create-workspace-btn'] button");
      await page.fill("input[name='name']", 'Test Workspace E2E Created');
      await page.fill("input[name='description']", 'Description');
      await page.click("button:has-text('Create')");
      await expect(page.locator('text=Test Workspace E2E Created')).toBeVisible();
    }
  });
});
