import { Icon, ICON_NAMES } from '#libs/ui-core';
import { Example } from '../components/example/Example.tsx';
import styles from './foundations.section.module.css';

const COLOR_GROUPS = [
	{
		note: 'The color of the app, royal blue unless the app sets its own on :root, and what follows from it. The fill is the color of actions: AA under white text.',
		title: 'Primary',
		tokens: [
			'primary',
			'primary-fill',
			'secondary',
			'secondary-foreground',
			'accent',
			'ring',
		],
	},
	{
		note: 'The page, the cards on it, the second surface and their borders.',
		title: 'Surfaces and lines',
		tokens: [
			'page',
			'card',
			'popover',
			'surface-2',
			'muted',
			'line',
			'line-soft',
			'border',
			'input',
		],
	},
	{
		note: 'The text: the main ink, the soft one for what is secondary and the faint one for what only gives order.',
		title: 'Inks',
		tokens: [
			'foreground',
			'foreground-soft',
			'foreground-faint',
			'heading',
			'link',
		],
	},
	{
		note: 'Information, success, warning and danger: strong, base, subtle and its text (AA on the subtle one).',
		title: 'Status',
		tokens: ['info', 'success', 'warning', 'danger'].flatMap((status) =>
			['strong', 'base', 'subtle', 'text'].map(
				(step) => `${status}-${step}`,
			),
		),
	},
] as const;

const FONT_SIZES = [12, 13, 14, 16, 18, 20, 24, 28, 32, 36, 40] as const;

const SPACES = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64] as const;

const SHADOWS = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

const RADII = ['base', 'control', 'surface', 'full'] as const;

const DURATIONS = ['fast', 'normal', 'slow'] as const;

/**
 * Foundations of the kit: the design tokens (colors, type, space, radii, shadows,
 * motion) and the icons, in the theme of the page.
 *
 * @returns section
 */
export const FoundationsSection = () => (
	<>
		{COLOR_GROUPS.map(({ note, title, tokens }) => (
			<Example key={title} layout='grid' note={note} title={title}>
				{tokens.map((token) => (
					<figure className={styles.swatch} key={token}>
						<span
							className={styles.color}
							style={{
								backgroundColor: `var(--ui-color-${token})`,
							}}
						/>
						<figcaption>
							<code>--ui-color-{token}</code>
						</figcaption>
					</figure>
				))}
			</Example>
		))}

		<Example
			layout='stack'
			note='One family for everything, the font of the app (--ui-font-body): a heading is told from the text by its weight and its size. The sizes are the steps of --ui-font-size-*.'
			title='Typography'
		>
			<div className={styles.headings}>
				<h1>Module title</h1>
				<h2>Section title</h2>
				<h3>Card title</h3>
				<h4>Group title</h4>
				<p>
					Reading text at 16 px. A <a href='#typography'>link</a>{' '}
					takes a deeper shade of the primary color, never its solid
					fill.
				</p>
			</div>

			<ul className={styles.scale}>
				{FONT_SIZES.map((size) => (
					<li key={size}>
						<code>{size}</code>
						<span
							style={{ fontSize: `var(--ui-font-size-${size})` }}
						>
							The quick brown fox jumps over the lazy dog
						</span>
					</li>
				))}
			</ul>
		</Example>

		<Example
			note='The space between elements comes from this scale (--ui-space-*), in pixels.'
			title='Spacing'
		>
			{SPACES.map((space) => (
				<figure className={styles.space} key={space}>
					<span
						className={styles.bar}
						style={{ inlineSize: `var(--ui-space-${space})` }}
					/>
					<figcaption>
						<code>{space}</code>
					</figcaption>
				</figure>
			))}
		</Example>

		<Example
			note='Controls at 10 px, surfaces at 12 px; icon-only buttons are fully round. Shadows grow with the elevation, in one scale.'
			title='Radii and shadows'
		>
			{RADII.map((radius) => (
				<figure className={styles.swatch} key={radius}>
					<span
						className={styles.shape}
						style={{ borderRadius: `var(--ui-radius-${radius})` }}
					/>
					<figcaption>
						<code>--ui-radius-{radius}</code>
					</figcaption>
				</figure>
			))}

			{SHADOWS.map((shadow) => (
				<figure className={styles.swatch} key={shadow}>
					<span
						className={styles.shape}
						style={{ boxShadow: `var(--ui-shadow-${shadow})` }}
					/>
					<figcaption>
						<code>--ui-shadow-{shadow}</code>
					</figcaption>
				</figure>
			))}
		</Example>

		<Example
			note='Short transitions on a single curve: fast for states, normal for what appears, slow for what crosses the screen. Hover to see them; with reduced motion, nothing slides.'
			title='Motion'
		>
			{DURATIONS.map((duration) => (
				<figure className={styles.swatch} key={duration}>
					<span
						className={styles.motion}
						style={{
							transitionDuration: `var(--ui-duration-${duration})`,
						}}
					/>
					<figcaption>
						<code>--ui-duration-{duration}</code>
					</figcaption>
				</figure>
			))}
		</Example>

		<Example
			layout='grid'
			note='Line icons (lucide) in the color of the text. Decorative by default; with a label they say something on their own.'
			title={`Icons (${ICON_NAMES.length})`}
		>
			{ICON_NAMES.map((name) => (
				<figure className={styles.icon} key={name}>
					<Icon name={name} size='lg' />
					<figcaption>
						<code>{name}</code>
					</figcaption>
				</figure>
			))}
		</Example>
	</>
);
