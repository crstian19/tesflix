import { describe, expect, it } from 'vitest';
import { buildLaunchUrl, YOUTUBE_REDIRECT } from './url';

describe('buildLaunchUrl', () => {
	it('wraps a full https URL with the YouTube redirect', () => {
		expect(buildLaunchUrl('https://example.com')).toBe(
			`${YOUTUBE_REDIRECT}${encodeURIComponent('https://example.com')}`
		);
	});

	it('wraps a full http URL and preserves the scheme', () => {
		expect(buildLaunchUrl('http://example.com/page')).toBe(
			`${YOUTUBE_REDIRECT}${encodeURIComponent('http://example.com/page')}`
		);
	});

	it('adds https:// to bare domains (e.g. host:port)', () => {
		expect(buildLaunchUrl('192.168.1.10:8006')).toBe(
			`${YOUTUBE_REDIRECT}${encodeURIComponent('https://192.168.1.10:8006')}`
		);
	});

	it('trims whitespace before normalizing', () => {
		expect(buildLaunchUrl('  example.com  ')).toBe(
			`${YOUTUBE_REDIRECT}${encodeURIComponent('https://example.com')}`
		);
	});

	it('keeps query strings and hashes, properly encoded', () => {
		const wrapped = buildLaunchUrl('https://example.com/search?q=a b&x=1#top')!;
		expect(wrapped.startsWith(YOUTUBE_REDIRECT)).toBe(true);
		const inner = decodeURIComponent(wrapped.slice(YOUTUBE_REDIRECT.length));
		expect(inner).toBe('https://example.com/search?q=a b&x=1#top');
	});

	it('returns null for empty input', () => {
		expect(buildLaunchUrl('')).toBeNull();
	});

	it('returns null for whitespace-only input', () => {
		expect(buildLaunchUrl('   ')).toBeNull();
	});

	it('returns null for invalid URLs', () => {
		expect(buildLaunchUrl('https://not a url')).toBeNull(); // spaces in host
		expect(buildLaunchUrl('not a url')).toBeNull();
		expect(buildLaunchUrl('http://')).toBeNull(); // empty host
	});

	// Regression: Chromium's URL parser accepts 'https://not a url' by
	// percent-encoding the spaces in the host, so parser errors alone are
	// not enough — whitespace in the resolved host must be rejected too.
	it('rejects hosts containing encoded whitespace (Chromium regression)', () => {
		expect(buildLaunchUrl('https://not%20a%20url')).toBeNull();
	});

	it('accepts bare LAN hostnames without dots', () => {
		expect(buildLaunchUrl('myserver:8096')).toBe(
			`${YOUTUBE_REDIRECT}${encodeURIComponent('https://myserver:8096')}`
		);
	});
});
