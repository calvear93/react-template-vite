import { z } from 'zod';

/**
 * ___SchemaName___ Schema.
 *
 * On a hot path (many parses per second, or re-validated on every keystroke),
 * wrap the export in `z.compile()` (Zod 4.5) — an AOT fast validation path,
 * same API and inferred type. See the `zod-schema` skill, "AOT compilation".
 */
export const ___SchemaName___Schema = z.object({
	prop: z.string().describe('my prop'),
});

export type ___SchemaName___ = z.infer<typeof ___SchemaName___Schema>;
