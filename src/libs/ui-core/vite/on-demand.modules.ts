/**
 * The modules of the UI kit that are loaded on demand (`../internal/on-demand.ts`):
 * each part with the modules only it uses, its stylesheet too. A new part adds its
 * modules here; the build fails when one is missing (`kitOnDemand`).
 */
export const UI_ON_DEMAND =
	/src\/libs\/ui-core\/components\/(?:alert-dialog\/(?:AlertDialog|ChoiceDialog|PromptDialog|Question)|settings-dialog\/(?:SettingsDialog\.module|SettingsGroup|SettingsWindow|settings\.panes))\./u;
