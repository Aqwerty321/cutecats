import { expect, test } from '@playwright/test';

test('home page loads without console errors', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  await page.goto('/');
  await expect(page.getByTestId('room-sanctuary')).toBeVisible();
  expect(consoleErrors).toHaveLength(0);
});

test('room portal navigation works across primary rooms', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('portal-playroom')).toBeVisible();
  await page.getByTestId('portal-playroom').click({ force: true });
  await expect(page.getByTestId('room-playroom')).toBeVisible();
  await page.waitForTimeout(900);

  await expect(page.getByTestId('portal-gallery')).toBeVisible();
  await page.getByTestId('portal-gallery').click({ force: true });
  await expect(page.getByTestId('room-gallery')).toBeVisible();
  await page.waitForTimeout(900);

  await expect(page.getByTestId('portal-sanctuary')).toBeVisible();
  await page.getByTestId('portal-sanctuary').click({ force: true });
  await expect(page.getByTestId('room-sanctuary')).toBeVisible();
});

test('basic drag and click interactions do not break the page', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('portal-playroom').click({ force: true });
  await expect(page.getByTestId('room-playroom')).toBeVisible();
  await page.waitForTimeout(900);

  const yarn = page.locator('[data-object-id="yarn-1"]').first();
  await yarn.hover();
  await page.mouse.down();
  await page.mouse.move(500, 500);
  await page.mouse.up();

  await page.mouse.click(600, 350);
  await expect(page.getByText('Drag toys, pop bubbles, and energize the room.')).toBeVisible();
});

test('room portals support keyboard navigation', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('portal-playroom').focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('room-playroom')).toBeVisible();
  await page.waitForTimeout(900);

  await page.getByTestId('portal-sanctuary').focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('room-sanctuary')).toBeVisible();
});
