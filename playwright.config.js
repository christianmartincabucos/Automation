
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  testMatch: 'video-progress.spec.js',

  workers: 1,

  retries: 0,

  use: {
    headless: true,
    browserName: 'chromium'
  }
});
