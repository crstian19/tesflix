import { defineConfig, fontProviders } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	integrations: [svelte()],
	vite: {
		plugins: [tailwindcss()]
	},
	fonts: [{
		provider: fontProviders.google(),
		name: 'Inter',
		cssVariable: '--font-inter',
		weights: [400, 500, 600, 700, 900]
	}]
});
