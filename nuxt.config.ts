// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-11-24',
	devtools: { enabled: true },
	modules: [
		'@nuxt/eslint',
		'@nuxt/fonts',
		'@nuxt/icon',
		'@nuxtjs/color-mode',
	],
	css: ['~/styles/global.scss'],
	nitro: {
		experimental: {
			websocket: true,
		},
		esbuild: {
			options: {
				target: 'esnext',
			},
		},
	},
	vite: {
		server: {
			allowedHosts: ['chong.musub.io', 'chingchongchinese.musub.io'],
		},
	},
	// https://fonts.nuxt.com/get-started/configuration
	fonts: {
		defaults: {
			weights: ['100 900'],
			styles: ['normal', 'italic'],
		},
		// Optical size, fill, grade variable axes seem to not be supported
		families: [
			// 	{
			// 		name: 'Material Symbols Outlined',
			// 		provider: 'googleicons',
			// 		fallbacks: [],
			// 		weights: ['100 700'],
			// 	},
			{
				name: 'Playfair Display',
				provider: 'google',
				fallbacks: [],
				weights: ['400 900'],
			},
		],
	},
	// https://color-mode.nuxtjs.org/usage/configuration
	colorMode: {
		preference: 'system',
		fallback: 'dark',
		dataValue: 'bs-theme',
	},
});
