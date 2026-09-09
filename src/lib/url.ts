export const YOUTUBE_REDIRECT = 'https://www.youtube.com/redirect?q=';

/**
 * Normalizes a raw user-provided URL and wraps it with Tesla's fullscreen
 * YouTube-redirect trick. Returns the wrapped URL, or null when the input
 * is empty or not a valid URL.
 *
 * Note: Chromium's URL parser is lenient — it happily accepts things like
 * 'https://not a url' by percent-encoding the spaces in the host. So beyond
 * letting `new URL()` throw, we explicitly reject empty hosts and hosts
 * containing whitespace (raw or percent-encoded).
 */
export function buildLaunchUrl(raw: string): string | null {
	let target = raw.trim();
	if (!target) return null;

	if (!target.startsWith('http://') && !target.startsWith('https://')) {
		target = 'https://' + target;
	}

	let parsed: URL;
	try {
		parsed = new URL(target);
	} catch {
		return null;
	}

	if (!parsed.hostname) return null;
	if (/\s/.test(parsed.hostname)) return null;
	try {
		if (/\s/.test(decodeURIComponent(parsed.hostname))) return null;
	} catch {
		return null; // malformed percent-encoding in the host
	}

	return `${YOUTUBE_REDIRECT}${encodeURIComponent(target)}`;
}
