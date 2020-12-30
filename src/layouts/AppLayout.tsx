import React, { FC, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useRouteNode } from 'react-router5';
import { keyBy } from 'lodash';
import routes from '../router/routes';
import { ReactQueryConfigProvider } from 'react-query';
import styled, { css } from 'styled-components';
import Box from '../components/layout/box/Box';
import Stack from '../components/layout/stack/Stack';
import Header from '../components/ui/header/Header';
import Footer from '../components/ui/footer/Footer';

import { ThemeProp } from '../components/theme_utils';
import { useDebouncedCallback } from 'use-debounce/lib';

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

const AppLayout = styled(Box)<ThemeProp>`
    width: 100%;
    height: auto;
    display: block;
    // background-color: ${props => props.theme[props.innerTheme].background};
    background: rgb(27,29,44);
    background: radial-gradient(circle, rgba(27,29,44,1) 57%, rgba(22,24,37,1) 100%);
    font-family: 'Inter', sans-serif;
    -webkit-font-smoothing: antialiased;
    overflow-y: scroll;
    overflow-x: hidden;
`;

const FullWidthStack = styled(Stack)`
    width: 100%;
    height: 100%;
`;

const AppContext = React.createContext({} as any);
export const useAppContext = () => useContext(AppContext);

const App: FC<Props> = props => {
    const { route } = useRouteNode('');
    const onScrollToEnd = useRef(() => false);
    const [heading, setHeading] = useState('');
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const scrollContainerRef = useRef(null);

    const setScrollToEndHandler = useCallback(func => {
        onScrollToEnd.current = func;
    }, []);

    const handleScrollToEnd = useDebouncedCallback(() => {
        if (
            scrollContainerRef &&
            scrollContainerRef.current.offsetHeight + scrollContainerRef.current.scrollTop >= scrollContainerRef.current.scrollHeight - 50
        ) {
            if (onScrollToEnd.current) onScrollToEnd.current();
        }
    }, 100);

    useEffect(() => {
        if (scrollContainerRef) {
            scrollContainerRef.current.onscroll = handleScrollToEnd.callback;
        }
    }, [scrollContainerRef]);

    return (
        <ReactQueryConfigProvider config={{ queries: { retry: 0, refetchOnWindowFocus: false } }}>
            <AppContext.Provider value={{ heading, setHeading, theme, setTheme, setScrollToEndHandler }}>
                <AppLayout ref={scrollContainerRef} innerTheme={theme}>
                    <FullWidthStack>
                        <Header heading={heading} />
                        <RouteRenderer route={route} />
                        <Footer />
                    </FullWidthStack>
                </AppLayout>
            </AppContext.Provider>
        </ReactQueryConfigProvider>
    );
};

export default App;
