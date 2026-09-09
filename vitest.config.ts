import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [svelte()],
	resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined,
	test: {
		environment: 'happy-dom',
		include: ['src/**/*.test.ts'],
		setupFiles: ['src/test/setup.ts']
	}
});
