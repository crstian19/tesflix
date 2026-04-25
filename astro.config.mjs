import { defineConfig, fontProviders } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	site: 'https://tesflix.crstian.me',
	integrations: [svelte(), sitemap({ filter: (page) => !page.includes('/me') })],
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
