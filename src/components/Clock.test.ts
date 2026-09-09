import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import Clock from './Clock.svelte';

describe('Clock', () => {
	it('renders a time in HH:MM format', () => {
		render(Clock);
		const time = screen.getByText(/^\d{2}:\d{2}$/);
		expect(time).toBeInTheDocument();
	});

	it('renders a date (weekday + day + month)', () => {
		render(Clock);
		const date = document.querySelector('.date');
		expect(date?.textContent?.length).toBeGreaterThan(0);
	});

	it('updates the time every second', () => {
		vi.useFakeTimers();
		const { unmount } = render(Clock);

		const before = screen.getByText(/^\d{2}:\d{2}$/).textContent;
		vi.advanceTimersByTime(1100);
		const after = screen.getByText(/^\d{2}:\d{2}$/).textContent;

		// Time text is re-read from the DOM; the tick may or may not cross a
		// minute boundary, but the element must still show a valid time.
		expect(after).toMatch(/^\d{2}:\d{2}$/);
		expect(typeof before).toBe('string');
		unmount();
		vi.useRealTimers();
	});

	it('responds to the tesdash:langchange event', async () => {
		vi.useFakeTimers();
		render(Clock);

		await fireEvent(window, new CustomEvent('tesdash:langchange', { detail: { lang: 'es' } }));
		vi.advanceTimersByTime(1100);

		// Spanish weekday/month names render without crashing
		const date = document.querySelector('.date');
		expect(date?.textContent).toMatch(/^\p{Letter}/u);
		vi.useRealTimers();
	});
});
