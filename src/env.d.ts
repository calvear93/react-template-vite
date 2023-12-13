/**
 * Global types definition for
 * environment variables.
 *
 * @remarks environment variables schema
 */
interface ImportMetaEnv {
	readonly NODE_ENV: 'development' | 'production' | 'test';
	readonly MODE: 'dev' | 'release';

	readonly DEV: 'true' | 'false';
	readonly PROD: 'true' | 'false';
	readonly VITEST: 'true' | 'false';
	readonly SSR: 'true' | 'false';

	// SECTION: base config
	readonly PORT: string;
	readonly BASE_URL: string;

	// SECTION: project info from package.json
	readonly VITE_APP_VERSION: string;
	readonly VITE_APP_PROJECT: string;
	readonly VITE_APP_NAME: string;
	readonly VITE_APP_TITLE: string;
	readonly VITE_APP_DESCRIPTION: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
