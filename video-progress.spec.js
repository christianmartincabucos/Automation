
const { test, expect } = require('@playwright/test');
const fs = require('fs');

test('Automatically play and monitor full-view confirmation', async ({ page }) => {
  test.setTimeout(25 * 60 * 1000);

  fs.mkdirSync('screenshots', { recursive: true });

  const url =
    'https://cb3newsmonitoringdashboard.lovable.app/lokal/langtad';

  await page.goto(url, {
    waitUntil: 'domcontentloaded'
  });

  console.log('[START] Dashboard opened.');

  // Locate YouTube player
  const iframe = page.locator('iframe[src*="youtube"]').first();

  await expect(iframe).toBeVisible({ timeout: 30000 });
  await iframe.scrollIntoViewIfNeeded();

  const player = page.frameLocator(
    'iframe[src*="youtube"]'
  ).first();

  const video = player.locator('video');

  await expect(video).toBeVisible({ timeout: 30000 });

  console.log('[PLAYER] YouTube player detected.');

  // Attempt to start playback
  const playButton = player.locator(
    '.ytp-large-play-button'
  );

  const buttonVisible = await playButton
    .isVisible()
    .catch(() => false);

  if (buttonVisible) {
    await playButton.click();
    console.log('[PLAY] Clicked YouTube play button.');
  } else {
    const bounds = await iframe.boundingBox();

    if (!bounds) {
      throw new Error('YouTube player is not visible.');
    }

    await page.mouse.click(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2
    );

    console.log('[PLAY] Clicked center of player.');
  }

  // Verify actual playback
  await expect.poll(
    async () => {
      return video.evaluate(v => ({
        paused: v.paused,
        currentTime: v.currentTime
      }));
    },
    {
      timeout: 30000,
      intervals: [1000, 2000],
      message: 'Waiting for playback to start'
    }
  ).toMatchObject({
    paused: false
  });

  console.log('[PLAYING] Playback started.');

  // Monitor dashboard progress and confirmation
  let lastProgress = -1;

  const successMessage = page.getByText(
    'Salamat! Your full view was counted for your lokal.',
    { exact: true }
  );

  console.log('[MONITOR] Waiting for confirmation.');

  try {
    await expect.poll(
      async () => {
        const body = await page.locator('body').innerText();

        const match = body.match(/Watched\s+(\d+)%/);

        if (match) {
          const progress = Number(match[1]);

          if (progress !== lastProgress) {
            console.log(`[PROGRESS] Watched ${progress}%`);
            lastProgress = progress;
          }
        }

        return await successMessage.isVisible().catch(() => false);
      },
      {
        timeout: 20 * 60 * 1000,
        intervals: [2000, 3000],
        message: 'Waiting for full-view confirmation'
      }
    ).toBe(true);

    console.log('[SUCCESS] Full-view confirmation detected.');

    await page.screenshot({
      path: 'screenshots/full-view-confirmed.png',
      fullPage: true
    });

  } catch (error) {
    console.log('[FAILED] Confirmation not detected.');

    await page.screenshot({
      path: 'screenshots/full-view-failed.png',
      fullPage: true
    });

    throw error;
  }
});
