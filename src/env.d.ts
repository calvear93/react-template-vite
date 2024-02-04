type MODE = 'development' | 'production' | 'test';

/**
 * Global types definition for
 * environment variables.
 *
 * @remarks environment variables schema
 */
interface ImportMetaEnv {
	readonly NODE_ENV: MODE;
	readonly MODE: MODE;
	readonly APP_ENV: 'dev' | 'release';

	readonly DEV: 'true' | 'false';
	readonly PROD: 'true' | 'false';
	readonly VITEST: 'true' | 'false';
	readonly SSR: 'true' | 'false';

	// SECTION: base config
	readonly PORT: string;
	readonly BASE_URL: string;

	// SECTION: project info from package.json
	readonly APP_VERSION: string;
	readonly APP_NAME: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
