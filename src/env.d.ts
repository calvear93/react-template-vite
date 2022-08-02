/// <reference types="vite/client" />

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

/**
 * Global types definition for
 * environment variables.
 *
 * @summary environment variables schema
 */
interface ImportMetaEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly VITE_APP_ENV: 'dev' | 'qa' | 'prod';
    readonly DEBUG?: string;

    // SECTION: project info from package.json
    readonly VITE_APP_VERSION: string;
    readonly VITE_APP_PROJECT: string;
    readonly VITE_APP_NAME: string;
    readonly VITE_APP_TITLE: string;
    readonly VITE_APP_DESCRIPTION: string;

    // SECTION: base config
    readonly PORT: string;
    readonly PUBLIC_URL: string;
    readonly VITE_APP_DEBUG: 'true' | 'false';
    readonly VITE_APP_SERVICE_WORKER: 'true' | 'false';
    readonly VITE_APP_BASE_PATH: string;
}

declare global {
    // SECTION: global custom types
    type decimal = number;

    type seconds = number;

    type millis = number;

    // Unix timestamp, number of seconds that have elapsed since January 1, 1970
    type epoch = seconds;

    type AnyError = unknown;
}

export {};
