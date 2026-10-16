import type { EnvName } from '@calvear/env';
import type appsettings from '../env/appsettings.json';
import type schema from '../env/settings/schema.json';

/**
 * import.meta.env (the APP_* variables, envPrefix of vite.config.ts) and
 * process.env (every variable, for vite.config.ts) typed by @calvear/env from
 * env/appsettings.json (every section, environment and mode) and
 * env/settings/schema.json: a new variable goes there, not here. Booleans
 * are 'false' | 'true' and the rest string. Vite's own (BASE_URL, MODE,
 * DEV, PROD, SSR) keep Vite's types.
 *
 * @see https://github.com/calvear93/env#-type-safe-env-variables-typescript
 */
declare module '@calvear/env' {
	interface EnvRegister {
		appsettings: typeof appsettings;
		// nestingDelimiter of env/settings/settings.json
		delimiter: '_';
		// envPrefix of vite.config.ts: import.meta.env only gets these
		envPrefix: 'APP_';
		schema: typeof schema;
		// narrower than the derived type
		overrides: {
			APP_ENV: EnvName<typeof appsettings>; // [[ENV]]: the environment
			NODE_ENV: 'development' | 'production' | 'test';
		};
	}
}

declare global {
	// import.meta.env only has the declared keys: no `any` fallback
	interface ViteTypeOptions {
		strictImportMetaEnv: unknown;
	}
}
