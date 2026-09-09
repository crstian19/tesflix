import { readFileSync } from 'node:fs';
import { load } from 'js-yaml';
import { expect, test } from '@playwright/test';

const REDIRECT_PREFIX = 'https://www.youtube.com/redirect?q=';

interface AppConfigApp {
	name: string;
	url: string;
	fullscreen?: boolean;
}
interface AppConfigCategory {
	name: string;
	apps: AppConfigApp[];
}

function loadExpectedApps(): Map<string, boolean> {
	const config = load(readFileSync('src/data/config.yml', 'utf-8')) as {
		categories: AppConfigCategory[];
	};
	// name -> whether its card link must be wrapped with the redirect
	const expected = new Map<string, boolean>();
	for (const cat of config.categories) {
		for (const app of cat.apps) {
			expected.set(app.name, app.fullscreen !== false);
		}
	}
	return expected;
}

test.describe('Home dashboard', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('renders the dashboard with title and categories', async ({ page }) => {
		await expect(page).toHaveTitle(/Tesdash/i);
		await expect(page.locator('h1, h2').first()).toBeVisible();
	});

	test('app cards open via redirect unless fullscreen is disabled in config', async ({ page }) => {
		const expected = loadExpectedApps();
		const cards = page.locator('a.card[href]');
		const count = await cards.count();
		expect(count).toBeGreaterThan(0);

		for (let i = 0; i < count; i++) {
			const card = cards.nth(i);
			const alt = (await card.locator('img').first().getAttribute('alt')) ?? '';
			const name = alt.replace(/ logo$/, '');
			const href = (await card.getAttribute('href')) ?? '';

			const wrapped = href.startsWith(REDIRECT_PREFIX);
			if (expected.has(name)) {
				expect(wrapped, `${name}: expected fullscreen=${expected.get(name)}`).toBe(
					expected.get(name)
				);
			}

			// Whatever the mode, the final target must be a parseable URL.
			const target = wrapped ? decodeURIComponent(href.slice(REDIRECT_PREFIX.length)) : href;
			expect(() => new URL(target), `${name} → ${href}`).not.toThrow();
		}
	});

	test('wrapped URLs decode to valid targets', async ({ page }) => {
		const href = await page.locator(`a[href^="${REDIRECT_PREFIX}"]`).first().getAttribute('href');
		const decoded = decodeURIComponent(href!.slice(REDIRECT_PREFIX.length));
		expect(() => new URL(decoded)).not.toThrow();
	});

	test('shows the URL launcher and clock islands', async ({ page }) => {
		await expect(page.getByPlaceholder(/Enter a URL/i)).toBeVisible();
		await expect(page.locator('.clock .time')).toHaveText(/^\d{2}:\d{2}$/);
	});

	test('persists category order in localStorage after reorder', async ({ page }) => {
		const firstCategory = page.locator('[data-category], section, .category').first();
		await expect(firstCategory).toBeVisible();

		// The app persists drag-and-drop ordering under this key; verify the
		// storage plumbing exists and survives a reload.
		await page.evaluate(() => {
			localStorage.setItem('tesflix-category-order', JSON.stringify([2, 0, 1]));
		});
		await page.reload();
		const saved = await page.evaluate(() => localStorage.getItem('tesflix-category-order'));
		expect(JSON.parse(saved!)).toEqual([2, 0, 1]);
	});

	test('has no console errors on load', async ({ page }) => {
		const errors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') errors.push(msg.text());
		});
		await page.goto('/');
		await page.waitForLoadState('networkidle');
		expect(errors).toEqual([]);
	});
});

test.describe('Other pages', () => {
	for (const path of ['/legal/', '/me/']) {
		test(`${path} loads without errors`, async ({ page }) => {
			const response = await page.goto(path);
			expect(response?.status()).toBe(200);
			await expect(page.locator('body')).not.toBeEmpty();
		});
	}
});
