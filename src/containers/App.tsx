import React, { FC, useEffect } from 'react';
import { RouterProvider } from 'react-router5';
import AppLayout from '../layouts/AppLayout';

import { ThemeProvider } from 'styled-components';
import Theme from '../style/Theme';

type Props = {
    router?: any;
};

const AppContainer: FC<Props> = ({ router }) => {
    useEffect(() => {
        
    }, []);

    return (
        <RouterProvider router={router}>
            <ThemeProvider theme={Theme}>
                <AppLayout />
            </ThemeProvider>
        </RouterProvider>
    );
};

export default AppContainer;
