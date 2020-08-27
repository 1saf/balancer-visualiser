import React, { FC } from 'react';
import { useRouteNode } from 'react-router5';
import { keyBy } from 'lodash';
import routes from '../router/routes';
import { ReactQueryConfigProvider } from 'react-query';
import styled from 'styled-components';

type Props = {};

type RouteRendererProps = {
    route: any;
};

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

const AppLayout = styled.div`
    background-color: ${props => props.theme.background};
    width: 100%;
    height: 100%;
`

const App: FC<Props> = props => {
    const { route } = useRouteNode('');

    return (
        <ReactQueryConfigProvider config={{ queries: { retry: 0, refetchOnWindowFocus: false } }}>
            <AppLayout>
                <RouteRenderer route={route} />
            </AppLayout>
        </ReactQueryConfigProvider>
    );
};

export default App;
