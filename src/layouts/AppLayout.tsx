import React, { FC, useMemo } from 'react';
import { useRouteNode } from 'react-router5';
import { State as RouterState } from 'router5';

import routes from '../router/routes';
import { keyBy } from 'lodash';

type RouteRendererProps = {
    routes?: any;
}

type RouteTree = {
    component: React.FC<any>;
    name: string;
    child: RouteTree;
}

const matchChild = (children: any, routes: string[], index: number): any => {
    if (!children?.length || index > routes.length) return;
    const matchedChild = children.find((child: any) => {
        if (child.name === routes[index]) return child;
    });
    if (!matchedChild) return;
    return {
        component: matchedChild.component,
        name: routes[index],
        child: matchChild(matchedChild.children, routes, index + 1),
    }
}


const renderTree = (node: any, routes: string[]) => {
    if (!node) return;
    return (
        <node.component>
            {renderTree(node.child, routes)}
        </node.component>
    )
}

const RouteRenderer: FC<RouteRendererProps> = ({ routes }) => {
    const { route } = useRouteNode('');
    const routeArray = route?.name?.split('.');
    const rootName = routeArray[0];
    const rootNode = routes[rootName];

    const routeTree: RouteTree = {
        component: rootNode.component,
        name: rootName,
        child: matchChild(rootNode.children, routeArray, 1),
    }

    return (
        <React.Fragment>
            {renderTree(routeTree, routeArray)}
        </React.Fragment>
    );
}

const AppLayout: FC<any> = (props) => {
    const keyedRoutes = useMemo(() => keyBy(routes, 'name'), []);
    return <RouteRenderer routes={keyedRoutes} />
}

export default AppLayout;