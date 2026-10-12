# Skill: testing

The stack is Vitest 5, Testing Library and happy-dom. For reference code, see
`src/app/pages/detail/Detail.page.spec.tsx`, `src/app/store/sample.store.spec.ts` and
`src/__tests__/`. The scaffolds (`react-vitest-test`, `vitest-test`) already follow this file.

## The one surprise

`vitest.config.ts` loads `@testing-library/react/dont-cleanup-after-each`, which means the DOM is
**not** cleaned up between tests. The convention is to render once in `beforeAll` and call
`cleanup()` in `afterAll`. If a test needs a fresh render, call `cleanup()` and then render.

## Shape

```tsx
// describe() takes the component reference, not a string
describe(UserCard, () => {
	// hooks
	beforeAll(() => {
		render(<UserCard name='Ada' />);
	});

	afterAll(cleanup);

	// tests
	test('shows the name', () => {
		expect(screen.getByRole('heading')).toHaveTextContent('Ada');
	});
});
```

- Use `test()`, never `it()`. Lint enforces this, along with the Testing Library and jest-dom
  rules (`screen`, no node access, and so on).
- Query by role or label first, and use `findBy*` for anything async or lazy (like `lazy()`
  routes and feature variants). Interact with `await userEvent.click(...)`.
- Code that depends on timers uses `vi.useFakeTimers()`, then `fireEvent` plus
  `await act(() => vi.advanceTimersToNextTimerAsync())`.
- Wrap what the test needs:
    - IoC mocks: `<InversionOfControlProvider values={new Map(...)}>`
    - flags: `<FeatureProvider handler={new FeatureHandler({...})}>`
    - routing: `createRouter({ type: 'memory' })`
- To test a store, call `renderHook(() => useAtom(store))`.
- To change env in a test, use `vi.stubEnv('APP_X', '…')`, then `vi.unstubAllEnvs()`.
- Cover the happy path, edge cases and the error path. Coverage target is ≥ 80% (bootstrap
  `app*`, mocks and `__tests__` are excluded). Use `pnpm test:mutation` for critical logic.
