import { expect, test } from '@playwright/test';

const REDIRECT_PREFIX = 'https://www.youtube.com/redirect?q=';

test.describe('URL launcher (E2E)', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('opens a bare domain in a new tab through the YouTube redirect', async ({ page }) => {
		const input = page.getByPlaceholder(/Enter a URL/i);
		await input.fill('192.168.1.10:8006');

		const popupPromise = page.waitForEvent('popup');
		await page.getByRole('button', { name: /Open/i }).click();
		const popup = await popupPromise;

		expect(popup.url()).toBe(
			`${REDIRECT_PREFIX}${encodeURIComponent('https://192.168.1.10:8006')}`
		);
		await popup.close();

		await expect(input).toHaveValue('');
	});

	test('keeps full URLs untouched apart from the redirect wrap', async ({ page }) => {
		const input = page.getByPlaceholder(/Enter a URL/i);
		await input.fill('https://example.com/search?q=a b#top');

		const popupPromise = page.waitForEvent('popup');
		await page.getByRole('button', { name: /Open/i }).click();
		const popup = await popupPromise;

		const inner = decodeURIComponent(popup.url().slice(REDIRECT_PREFIX.length));
		expect(inner).toBe('https://example.com/search?q=a b#top');
		await popup.close();
	});

	test('launches with the Enter key', async ({ page }) => {
		const input = page.getByPlaceholder(/Enter a URL/i);
		await input.fill('https://example.com');

		const popupPromise = page.waitForEvent('popup');
		await input.press('Enter');
		const popup = await popupPromise;

		expect(popup.url().startsWith(REDIRECT_PREFIX)).toBe(true);
		await popup.close();
	});

	test('shows the error message for invalid URLs without opening a tab', async ({ page }) => {
		const input = page.getByPlaceholder(/Enter a URL/i);
		await input.fill('https://not a url');
		await page.getByRole('button', { name: /Open/i }).click();

		await expect(page.getByText(/Invalid URL/i)).toBeVisible();

		// Give any accidental popup a moment to appear; none should.
		let popped = false;
		page.once('popup', () => (popped = true));
		await page.waitForTimeout(500);
		expect(popped).toBe(false);
	});

	test('error message is localized to Spanish after langchange', async ({ page }) => {
		await page.evaluate(() => {
			localStorage.setItem('tesdash-lang', 'es');
		});
		await page.reload();

		const input = page.getByPlaceholder(/Introduce una URL/i);
		await input.fill('https://not a url');
		await page.getByRole('button', { name: 'Abrir' }).click();

		await expect(page.getByText(/URL inv/i)).toBeVisible();
	});
});
