import { expect, test, type Page } from '@playwright/test';

async function goToPlayroom(page: Page) {
  await page.goto('/');
  await page.getByTestId('portal-playroom').click({ force: true });
  await expect(page.getByTestId('room-playroom')).toBeVisible();
  await page.waitForTimeout(900);
}

function readYarnCount(metricsText: string): number {
  const match = metricsText.match(/Yarn\s+(\d+)/i);
  return match ? Number(match[1]) : 0;
}

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
  await goToPlayroom(page);

  const yarn = page.locator('[data-object-id="yarn-1"]').first();
  await yarn.hover();
  await page.mouse.down();
  await page.mouse.move(500, 500);
  await page.mouse.up();

  await page.mouse.click(600, 350);
  await expect(page.getByTestId('playroom-helper-text')).toBeVisible();
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

test('yarn toss triggers chase status and updates play metrics', async ({ page }) => {
  await goToPlayroom(page);

  const room = page.getByTestId('playroom-room');
  const roomBox = await room.boundingBox();
  expect(roomBox).not.toBeNull();

  const yarn = page.locator('[data-object-id="yarn-1"]').first();
  const yarnBox = await yarn.boundingBox();
  expect(yarnBox).not.toBeNull();

  const targetX = roomBox!.x + roomBox!.width * 0.68;
  const targetY = roomBox!.y + roomBox!.height * 0.58;
  const beforeMetric = readYarnCount((await page.getByTestId('playroom-metrics').textContent()) ?? '');

  await page.mouse.move(yarnBox!.x + yarnBox!.width / 2, yarnBox!.y + yarnBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(targetX, targetY, { steps: 10 });
  await page.mouse.up();

  await expect(page.getByTestId('playroom-status-text')).toContainText(/Yarn chase active/i);
  const afterMetric = readYarnCount((await page.getByTestId('playroom-metrics').textContent()) ?? '');
  expect(afterMetric).toBeGreaterThanOrEqual(beforeMetric + 1);
});

test('bubble pops increase combo multiplier', async ({ page }) => {
  await goToPlayroom(page);

  const bubbles = page.locator('[data-object-id^="bubble-"]');
  await expect(bubbles.first()).toBeVisible();

  await bubbles.nth(0).click({ force: true });
  await page.waitForTimeout(220);
  await bubbles.nth(1).click({ force: true });

  await expect(page.getByTestId('playroom-combo-meter')).toContainText('x2');
});

test('playroom metrics persist after reload', async ({ page }) => {
  await goToPlayroom(page);

  const metrics = page.getByTestId('playroom-metrics');
  const beforeCount = readYarnCount((await metrics.textContent()) ?? '');

  await page.locator('[data-object-id="yarn-1"]').first().click({ force: true });
  await expect(metrics).toContainText(/Yarn\s+\d+/);

  const afterCount = readYarnCount((await metrics.textContent()) ?? '');
  expect(afterCount).toBeGreaterThanOrEqual(beforeCount + 1);

  await page.reload();
  await page.getByTestId('portal-playroom').click({ force: true });
  await expect(page.getByTestId('room-playroom')).toBeVisible();
  await page.waitForTimeout(900);

  const persistedCount = readYarnCount((await page.getByTestId('playroom-metrics').textContent()) ?? '');
  expect(persistedCount).toBeGreaterThanOrEqual(afterCount);
});
