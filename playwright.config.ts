import { defineConfig, devices } from '@playwright/test';

// Tesla's in-car browser is Chromium-based, so chromium is the faithful target.
export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
	use: {
		baseURL: 'http://localhost:4173',
		trace: 'retain-on-failure'
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: {
		command: 'bun run preview --port 4173',
		url: 'http://localhost:4173/',
		reuseExistingServer: !process.env.CI,
		timeout: 30_000
	}
});
