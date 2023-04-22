/**
 * Global types definition for
 * environment variables.
 *
 * @remarks environment variables schema
 */
interface ImportMetaEnv {
	readonly NODE_ENV: 'development' | 'production' | 'test';
	readonly MODE: NODE_ENV;
	readonly VITE_APP_ENV: 'dev' | 'release';

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

export declare global {
	// SECTION: built-in types tweaks
	interface JSON {
		parse<T = unknown>(
			text: string,
			reviver?: (this: any, key: string, value: any) => any,
		): T;
	}

	type ObjectKeys<T> = T extends object
		? (keyof T)[]
		: T extends number
		? []
		: T extends any[] | string
		? string[]
		: never;

	interface ObjectConstructor {
		keys<T>(o: T): ObjectKeys<T>;
	}

	// SECTION: global custom types
	type decimal = number;

	type seconds = number;

	type millis = number;

	type password = string;

	type bytes = number;

	type uuid = string;

	// unix timestamp, number of seconds that have elapsed since January 1, 1970
	type epoch = seconds;
}
