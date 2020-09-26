import React, { FC } from 'react';
import { useRouteNode } from 'react-router5';
import { keyBy } from 'lodash';
import routes from '../router/routes';
import { ReactQueryConfigProvider } from 'react-query';
import styled, { css } from 'styled-components';
import Box from '../components/layout/box/Box';
import Stack from '../components/layout/stack/Stack';
import Header from '../components/ui/header/Header';

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

const AppLayout = styled(Box)`
    background-color: ${props => props.theme.background};
    width: 100%;
    height: 100%;
    display: block;
    @font-face {
        font-family: SegoeUI;
        src: local('Segoe UI Light'), url(//c.s-microsoft.com/static/fonts/segoe-ui/west-european/light/latest.woff2) format('woff2'),
            url(//c.s-microsoft.com/static/fonts/segoe-ui/west-european/light/latest.woff) format('woff'),
            url(//c.s-microsoft.com/static/fonts/segoe-ui/west-european/light/latest.ttf) format('truetype');
        font-weight: 100;
    }

    @font-face {
        font-family: SegoeUI;
        src: local('Segoe UI Semilight'),
            url(//c.s-microsoft.com/static/fonts/segoe-ui/west-european/semilight/latest.woff2) format('woff2'),
            url(//c.s-microsoft.com/static/fonts/segoe-ui/west-european/semilight/latest.woff) format('woff'),
            url(//c.s-microsoft.com/static/fonts/segoe-ui/west-european/semilight/latest.ttf) format('truetype');
        font-weight: 200;
    }

    @font-face {
        font-family: SegoeUI;
        src: local('Segoe UI'), url(//c.s-microsoft.com/static/fonts/segoe-ui/west-european/normal/latest.woff2) format('woff2'),
            url(//c.s-microsoft.com/static/fonts/segoe-ui/west-european/normal/latest.woff) format('woff'),
            url(//c.s-microsoft.com/static/fonts/segoe-ui/west-european/normal/latest.ttf) format('truetype');
        font-weight: 400;
    }

    @font-face {
        font-family: SegoeUI;
        src: local('Segoe UI Bold'), url(//c.s-microsoft.com/static/fonts/segoe-ui/west-european/bold/latest.woff2) format('woff2'),
            url(//c.s-microsoft.com/static/fonts/segoe-ui/west-european/bold/latest.woff) format('woff'),
            url(//c.s-microsoft.com/static/fonts/segoe-ui/west-european/bold/latest.ttf) format('truetype');
        font-weight: 600;
    }

    @font-face {
        font-family: SegoeUI;
        src: local('Segoe UI Semibold'), url(//c.s-microsoft.com/static/fonts/segoe-ui/west-european/semibold/latest.woff2) format('woff2'),
            url(//c.s-microsoft.com/static/fonts/segoe-ui/west-european/semibold/latest.woff) format('woff'),
            url(//c.s-microsoft.com/static/fonts/segoe-ui/west-european/semibold/latest.ttf) format('truetype');
        font-weight: 700;
    }
    font-family: SegoeUI !important;
    -webkit-font-smoothing: antialiased;
`;

const FullWidthStack = styled(Stack)`
    width: 100%;
`;

const App: FC<Props> = props => {
    const { route } = useRouteNode('');

    return (
        <ReactQueryConfigProvider config={{ queries: { retry: 0, refetchOnWindowFocus: false } }}>
            <AppLayout>
                <FullWidthStack>
                    <Header />
                    <RouteRenderer route={route} />
                </FullWidthStack>
            </AppLayout>
        </ReactQueryConfigProvider>
    );
};

export default App;
