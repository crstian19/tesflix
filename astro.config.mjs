import { defineConfig, fontProviders } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	integrations: [svelte()],
	build: {
		inlineStylesheets: 'always'
	},
	vite: {
		plugins: [tailwindcss()]
	},
	fonts: [{
		provider: fontProviders.google(),
		name: 'Geist',
		cssVariable: '--font-geist',
		weights: [400, 500, 600, 700, 900]
	}]
});
