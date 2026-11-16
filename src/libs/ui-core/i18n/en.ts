/**
 * The texts of the kit in English, by component: the language of an app that sets none, and
 * the shape every other language follows. A text with a blank is a function of what fills it,
 * or a template with its name in braces (`{date}`) that the component fills.
 */
export const UI_TEXTS_EN = {
	dataGrid: {
		no: 'No',
		yes: 'Yes',
	},
	alert: {
		close: 'Close message',
		errorTitle: 'The action could not be completed',
		support: 'Support code',
	},
	alertDialog: {
		cancel: 'Cancel',
		close: 'Got it',
		confirm: 'Confirm',
		requireText: (text: string) => `Type “${text}” to confirm`,
	},
	amountMessages: {
		max: (limit: string) => `The maximum amount is ${limit}`,
		min: (limit: string) => `The minimum amount is ${limit}`,
	},
	appShell: {
		closeMenu: 'Close the menu',
		fold: 'Collapse the menu',
		home: 'Home',
		menu: 'Menu',
		navigation: 'Main menu',
		sidebar: 'Sidebar',
		skip: 'Skip to content',
		unfold: 'Expand the menu',
	},
	breadcrumb: {
		label: 'Breadcrumb',
	},
	calendar: {
		month: 'Month',
		next: 'Next month',
		previous: 'Previous month',
		year: 'Year',
	},
	chip: {
		remove: 'Remove',
		removeItem: (name: string) => `Remove ${name}`,
	},
	choiceDialog: {
		cancel: 'Cancel',
	},
	combobox: {
		empty: 'No results',
		error: 'The search failed. Try again.',
		list: 'Results',
		searching: 'Searching…',
		unpicked: 'Choose an option from the list',
	},
	dataTable: {
		attention: 'Needs attention',
		sortBy: 'Sort by',
	},
	dateMessages: {
		invalid: 'Not a valid date: use {format}, for example {example}',
		max: 'The date cannot be after {date}',
		min: 'The date cannot be before {date}',
		required: 'Type the date ({format}) or pick it in the calendar',
	},
	datePicker: {
		clear: 'Clear',
		day: 'dd',
		dialog: 'Choose a date',
		format: 'Format: {format}, for example {example}',
		month: 'mm',
		open: 'Open the calendar',
		today: 'Today',
		year: 'yyyy',
	},
	dialog: {
		cancel: 'Cancel',
		close: 'Close',
		submit: 'Save',
	},
	drawer: {
		close: 'Close the panel',
	},
	fileMessages: {
		required: 'Choose a file',
		single: 'Drop a single file',
		type: 'The file must be {accept}',
	},
	fileUpload: {
		change: 'Change the file',
		choose: 'Choose a file',
		remove: 'Remove the file',
	},
	filterChips: {
		all: 'All',
	},
	kpiRow: {
		link: 'View details',
	},
	label: {
		optional: '(optional)',
	},
	multiSelect: {
		clear: 'Clear',
		empty: 'No results',
		list: 'Options',
		placeholder: 'Select…',
		search: 'Search',
		selected: (count: number, formatted: string) => `${formatted} selected`,
	},
	pager: {
		go: 'Go',
		jump: 'Go to page',
		noun: ['result', 'results'] as readonly [one: string, other: string],
		sizes: 'Rows per page',
		outOfRange: (pages: string) => `Between 1 and ${pages}`,
		pageOf: (page: string, pages: string) => `page ${page} of ${pages}`,
		range: (from: string, to: string, counted: string) =>
			`Showing ${from}–${to} of ${counted}`,
	},
	pagination: {
		first: 'First page',
		last: 'Last page',
		navigation: 'Pagination',
		next: 'Next page',
		previous: 'Previous page',
		page: (page: number) => `Page ${page}`,
		position: (page: number, pages: number) => `Page ${page} of ${pages}`,
	},
	promptDialog: {
		cancel: 'Cancel',
		confirm: 'OK',
		required: 'Type a text to continue',
	},
	rutMessages: {
		invalid: 'Not a valid RUT',
		incomplete: 'Type the whole RUT, with its check digit',
		text: 'Not a valid RUT',
	},
	searchSelect: {
		clear: 'Clear the selection',
		empty: 'No results',
		list: 'Options',
		placeholder: 'Select…',
		search: 'Search',
	},
	settings: {
		accessibility: 'Accessibility',
		animations: 'Animations',
		appearance: 'Appearance',
		appearanceHint: 'How the application looks in this browser.',
		auto: 'Automatic',
		autoHint: 'Follows the system',
		close: 'Close the settings',
		contrast: 'Contrast',
		contrastMore: 'High',
		contrastNormal: 'Normal',
		dark: 'Dark',
		done: 'Done',
		language: 'Language',
		languageHint: 'The language of the texts, the dates and the numbers.',
		large: 'Large',
		light: 'Light',
		motion: 'Motion',
		motionFull: 'Full',
		motionReduce: 'Reduced',
		normal: 'Normal',
		reading: 'Reading',
		sections: 'Sections of the settings',
		systemContrast: 'Your system asks for more contrast.',
		systemMotion: 'Your system asks for less motion.',
		text: 'Text',
		textSize: 'Text size',
		textSizeHint: 'Large makes the text of the whole application bigger.',
		theme: 'Theme',
		title: 'Settings',
		underlineLinks: 'Underline links',
		underlineLinksHint: 'Links are told apart by more than their color.',
		accessibilityHint:
			'Settings to read and use the application more comfortably.',
		animationsHint:
			'Reduced: nothing slides or fades in; what is loading still shows.',
		contrastHint:
			'High: darker text, stronger borders and a more visible keyboard focus.',
	},
	spinner: {
		label: 'Loading',
	},
	stepper: {
		disabled: 'Not available',
		done: 'Completed',
		error: 'With an error',
	},
	stepperSummary: {
		position: (current: number, total: number) =>
			`Step ${current} of ${total}`,
	},
	tabs: {
		attention: 'needs attention',
	},
	timeline: {
		current: 'In progress',
		done: 'Completed',
		pending: 'Pending',
	},
	timeMessages: {
		invalid: 'Not a valid time: use hh:mm in 24 hours, for example 09:30',
		max: 'The time cannot be after {time}',
		min: 'The time cannot be before {time}',
		required: 'Type the time (hh:mm) or pick it in the panel',
	},
	timePicker: {
		clear: 'Clear',
		dialog: 'Choose a time',
		format: 'Format: hours and minutes in 24 hours, for example 09:30',
		hours: 'Hours',
		minutes: 'Minutes',
		now: 'Now',
		open: 'Open the time picker',
		times: 'Times',
	},
	toaster: {
		close: 'Close the notice',
		label: 'Notices',
	},
	userMenu: {
		menuOf: (name: string) => `Menu of ${name}`,
	},
};

/** The texts of the kit: every one, by component. */
export type UiTexts = typeof UI_TEXTS_EN;
