<script lang="ts">
	let locale = $state('en');
	let time = $state('--:--');
	let date = $state('');

	$effect(() => {
		// Init from localStorage (client-only)
		const saved = localStorage.getItem('tesdash-lang');
		locale = saved || navigator.language.split('-')[0] || 'en';

		const handler = (e: Event) => {
			const detail = (e as CustomEvent<{ lang: string }>).detail;
			if (detail?.lang) locale = detail.lang;
		};
		window.addEventListener('tesdash:langchange', handler);
		return () => window.removeEventListener('tesdash:langchange', handler);
	});

	$effect(() => {
		const currentLocale = locale;
		const update = () => {
			const d = new Date();
			time = d.toLocaleTimeString(currentLocale, { hour: '2-digit', minute: '2-digit', hour12: false });
			date = d.toLocaleDateString(currentLocale, { weekday: 'long', day: 'numeric', month: 'long' });
		};
		update();
		const interval = setInterval(update, 1000);
		return () => clearInterval(interval);
	});
</script>

<div class="clock">
	<p class="time">{time}</p>
	<p class="date">{date}</p>
</div>

<style>
	.clock {
		text-align: right;
	}

	.time {
		font-size: 2rem;
		font-weight: 700;
		color: #f8fafc;
		font-variant-numeric: tabular-nums;
		letter-spacing: 0.05em;
		line-height: 1;
	}

	.date {
		font-size: 0.75rem;
		color: #64748b;
		text-transform: capitalize;
		margin-top: 0.25rem;
		letter-spacing: 0.05em;
	}
</style>
