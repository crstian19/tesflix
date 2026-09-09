import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import UrlLauncher from './UrlLauncher.svelte';

const REDIRECT = 'https://www.youtube.com/redirect?q=';

function getInput(): HTMLInputElement {
	return screen.getByPlaceholderText(/Enter a URL/i) as HTMLInputElement;
}

async function typeUrl(value: string) {
	await fireEvent.input(getInput(), { target: { value } });
}

describe('UrlLauncher', () => {
	it('renders English labels by default', () => {
		render(UrlLauncher);
		expect(screen.getByPlaceholderText(/Enter a URL/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Open/i })).toBeInTheDocument();
	});

	it('opens the YouTube-redirect URL for a valid https input and clears the field', async () => {
		const open = vi.spyOn(window, 'open').mockImplementation(() => null);
		render(UrlLauncher);

		await typeUrl('https://example.com');
		await fireEvent.click(screen.getByRole('button', { name: /Open/i }));

		expect(open).toHaveBeenCalledWith(
			`${REDIRECT}${encodeURIComponent('https://example.com')}`,
			'_blank'
		);
		expect(getInput().value).toBe('');
		open.mockRestore();
	});

	it('adds https:// to bare domains before wrapping', async () => {
		const open = vi.spyOn(window, 'open').mockImplementation(() => null);
		render(UrlLauncher);

		await typeUrl('192.168.1.10:8006');
		await fireEvent.click(screen.getByRole('button', { name: /Open/i }));

		expect(open).toHaveBeenCalledWith(
			`${REDIRECT}${encodeURIComponent('https://192.168.1.10:8006')}`,
			'_blank'
		);
		open.mockRestore();
	});

	it('shows an error message for invalid URLs and does not open anything', async () => {
		const open = vi.spyOn(window, 'open').mockImplementation(() => null);
		render(UrlLauncher);

		await typeUrl('https://not a url');
		await fireEvent.click(screen.getByRole('button', { name: /Open/i }));

		expect(open).not.toHaveBeenCalled();
		expect(screen.getByText(/Invalid URL/i)).toBeInTheDocument();
		open.mockRestore();
	});

	it('does nothing for empty input', async () => {
		const open = vi.spyOn(window, 'open').mockImplementation(() => null);
		render(UrlLauncher);

		await typeUrl('   ');
		await fireEvent.click(screen.getByRole('button', { name: /Open/i }));

		expect(open).not.toHaveBeenCalled();
		expect(screen.queryByText(/Invalid URL/i)).not.toBeInTheDocument();
		open.mockRestore();
	});

	it('clears the error when typing again', async () => {
		const open = vi.spyOn(window, 'open').mockImplementation(() => null);
		render(UrlLauncher);

		await typeUrl('https://not a url');
		await fireEvent.click(screen.getByRole('button', { name: /Open/i }));
		expect(screen.getByText(/Invalid URL/i)).toBeInTheDocument();

		await typeUrl('https://example.com');
		expect(screen.queryByText(/Invalid URL/i)).not.toBeInTheDocument();
		open.mockRestore();
	});

	it('launches on Enter key', async () => {
		const open = vi.spyOn(window, 'open').mockImplementation(() => null);
		render(UrlLauncher);

		await typeUrl('https://example.com');
		await fireEvent.keyDown(getInput(), { key: 'Enter' });

		expect(open).toHaveBeenCalledTimes(1);
		open.mockRestore();
	});

	it('clears the input with the clear button', async () => {
		render(UrlLauncher);

		await typeUrl('https://example.com');
		await fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

		expect(getInput().value).toBe('');
	});

	it('uses the saved language from localStorage', async () => {
		localStorage.setItem('tesdash-lang', 'es');
		render(UrlLauncher);

		expect(screen.getByPlaceholderText(/Introduce una URL/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Abrir' })).toBeInTheDocument();
		localStorage.removeItem('tesdash-lang');
	});

	it('switches language when the tesdash:langchange event fires', async () => {
		render(UrlLauncher);
		expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();

		await fireEvent(window, new CustomEvent('tesdash:langchange', { detail: { lang: 'de' } }));

		expect(screen.getByRole('button', { name: 'Öffnen' })).toBeInTheDocument();
	});
});
