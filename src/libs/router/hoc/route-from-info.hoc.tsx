import { Route } from 'react-router-dom';
import { RouteComponent, RouteInfo } from '../route.interface';
import { routerService } from '../router.service';

/**
 * Wraps a page with a layout if defined.
 *
 * @param {JSX.Element | JSX.Element[]} Element
 * @param {RouteComponent | string} Layout
 * @param {React.ComponentProps<any>} props layout props
 *
 * @returns {JSX.Element | JSX.Element[]}
 */
export const wrapElementWithLayout = (
    Element: JSX.Element | JSX.Element[],
    Layout?: RouteComponent | string,
    props?: React.ComponentProps<any>
): JSX.Element | JSX.Element[] => {
    if (typeof Layout === 'string') Layout = routerService.getLayout(Layout);

    return Layout ? <Layout {...props}>{Element}</Layout> : Element;
};

/**
 * Wraps a component with a layout if defined.
 *
 * @param {RouteComponent} Component
 * @param {RouteComponent | string} Layout
 * @param {React.ComponentProps<any>} componentProps
 * @param {React.ComponentProps<any>} layoutProps
 *
 * @returns {JSX.Element}
 */
export const wrapComponentWithLayout = (
    Component: RouteComponent,
    Layout?: RouteComponent | string,
    componentProps?: React.ComponentProps<any>,
    layoutProps?: React.ComponentProps<any>
): JSX.Element => {
    if (typeof Layout === 'string') Layout = routerService.getLayout(Layout);

    return Layout ? (
        <Layout {...layoutProps}>
            <Component {...componentProps} />
        </Layout>
    ) : (
        <Component {...componentProps} />
    );
};

/**
 * Creates a Route from route info.
 *
 * @param {string} name component name
 * @param {RouteInfo} routeInfo path and route config
 *
 * @returns {JSX.Element}
 */
export const routeFromInfo = (
    name: string,
    { path, layout, page, config, pageProps, layoutProps }: RouteInfo
): JSX.Element => {
    const routePath = path as string;
    const Page = page ?? routerService.getPage(name);

    const render = wrapComponentWithLayout(
        Page,
        layout,
        pageProps,
        layoutProps
    );

    return (
        <Route
            id={routePath}
            key={routePath}
            path={routePath}
            element={render}
            {...config}
        />
    );
};
