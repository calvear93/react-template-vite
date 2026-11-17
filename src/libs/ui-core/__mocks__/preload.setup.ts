import { QUESTION } from '../components/alert-dialog/Dialogs.provider.tsx';
import { SETTINGS_WINDOW } from '../components/settings-dialog/settings-dialog.hook.ts';

/**
 * A setup file of Vitest (`setupFiles`): the parts of the kit that a browser loads
 * on demand (the dialogs of `useDialogs()`, the window of SettingsDialog) are
 * loaded before each spec file, as in a browser that was idle for a moment. A spec
 * opens them and finds them at once (`getByRole`), with no wait of its own.
 *
 * The path where they are not there yet is tested with fresh modules
 * (`vi.resetModules()`): see `Dialogs.loading.spec.tsx`.
 */
await Promise.all([QUESTION.load(), SETTINGS_WINDOW.load()]);
