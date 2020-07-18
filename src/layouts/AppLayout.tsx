import React, { FC, useMemo } from 'react';
import { useRouteNode } from 'react-router5';
import { State as RouterState } from 'router5';

import routes from '../router/routes';
import { keyBy } from 'lodash';

type RouteRendererProps = {
    routes?: any;
}

const RouteRenderer: FC<RouteRendererProps> = ({ routes }) => {
    const { route } = useRouteNode('');

    const splitRoute = route?.name?.split('.');
    const topRouteName = splitRoute[0];
    const childRouteName = splitRoute[1];
    const currentRootNode = routes[topRouteName];

    if (currentRootNode?.children) {
        const keyedChildRoutes = keyBy(currentRootNode.children, 'name');
        const childNode = keyedChildRoutes[childRouteName];
        return (
            <currentRootNode.component>
                <childNode.component />
            </currentRootNode.component>
        );
    }
    return <currentRootNode.component />
}

const AppLayout: FC<any> = (props) => {
    const keyedRoutes = useMemo(() => keyBy(routes, 'name'), []);
    return <RouteRenderer routes={keyedRoutes} />
}

export default AppLayout;