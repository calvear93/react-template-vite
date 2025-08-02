import { render, renderHook, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { createContainer } from './ioc.builder.tsx';

describe(createContainer, () => {
	// container creation
	const { InversionOfControlProvider, container, useInjection } =
		createContainer();
	// tokens
	const TEST_TOKEN = 'test_token';
	// dependencies
	const fn = () => 'test';
	class TestClass {
		test() {
			return 'test';
		}
	}
	// binding
	container.bind(TEST_TOKEN, fn);
	container.bind(TestClass, new TestClass());

	// tests
	test('useInjection returns dependency by token', () => {
		const {
			result: { current },
		} = renderHook(() => useInjection<typeof fn>(TEST_TOKEN));

		expect(current()).toBe('test');
	});

	test('useInjection returns dependency by class', () => {
		const {
			result: { current },
		} = renderHook(() => useInjection(TestClass));

		expect(current.test()).toBe('test');
	});

	test('InversionOfControlProvider replace the inner container', () => {
		const TestComponent = ({ id }: { id: string }) => {
			const provider = useInjection(TestClass);
			return <h1 data-testid={id}>{provider?.test()}</h1>;
		};
		const TestContainer = () => {
			return (
				<>
					<TestComponent id='c1' />
					<InversionOfControlProvider values={new Map()}>
						<TestComponent id='c2' />
					</InversionOfControlProvider>
					<TestComponent id='c3' />
				</>
			);
		};

		render(<TestContainer />);

		const c1 = screen.getByTestId('c1');
		const c2 = screen.getByTestId('c2');
		const c3 = screen.getByTestId('c3');

		expect(c1).toHaveTextContent('test');
		expect(c2).toHaveTextContent('');
		expect(c3).toHaveTextContent('test');
	});
});
