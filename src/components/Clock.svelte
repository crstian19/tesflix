<script lang="ts">
	let time = $state('--:--');
	let date = $state('');

	$effect(() => {
		const update = () => {
			const d = new Date();
			time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
			date = d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
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
