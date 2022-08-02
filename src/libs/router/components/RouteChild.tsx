import { useEffect } from 'react';
import { RouteDefinition } from '../interfaces/IRouteDefinition';

export interface RouteChildProps {
    route: RouteDefinition;
}

/**
 * Renders a route.
 *
 * @param {RouteChildProps} props
 *
 * @returns {JSX.Element | null} route child
 */
export const RouteChild: React.FC<RouteChildProps> = ({
    route
}): JSX.Element | null => {
    const { title, render: { layout: Layout, child: Child } = {} } = route;

    // sets up page tab title
    useEffect(() => {
        document.title = title ?? '';
    }, [title]);

    if (!Child) return null;

    return Layout ? (
        <Layout>
            <Child />
        </Layout>
    ) : (
        <Child />
    );
};
