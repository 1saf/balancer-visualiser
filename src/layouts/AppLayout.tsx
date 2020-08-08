import React, { FC, useMemo } from 'react';
import { useRouteNode } from 'react-router5';
import { State as RouterState } from 'router5';

import routes from '../router/routes';
import { keyBy } from 'lodash';

type RouteRendererProps = {
    routes?: any;
}

const viewMap = keyBy(routes, 'name');

const RouteRenderer: FC<RouteRendererProps> = ({ route }) => {
    if (!route) return null;
    const routeName = route?.name.split('.');
    const rootName = routeName[0];

    const view = viewMap[rootName];
    const children = view?.children;

    const childrenToRender = (children || []).reduce((toRender, child) => {
        const containsChild = routeName.findIndex((name: string) => name === child.name);
        if (containsChild > -1) {
            toRender.push(child);
        }
        return toRender;
    }, [] as any);

    return (
        <view.component>
            {childrenToRender.map((child: any) => (
                <child.component key={`child-${child.name}`} />
            ))}
        </view.component>
    );
};

const AppLayout: FC<any> = (props) => {
    const keyedRoutes = useMemo(() => keyBy(routes, 'name'), []);
    return <RouteRenderer routes={keyedRoutes} />
}

export default AppLayout;