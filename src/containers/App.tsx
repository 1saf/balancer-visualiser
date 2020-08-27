import React, { FC } from 'react';
import { RouterProvider } from 'react-router5';
import AppLayout from '../layouts/AppLayout';

import { ThemeProvider } from 'styled-components';
import Theme from '../style/Theme';

type Props = {
    router?: any;
};

const AppContainer: FC<Props> = ({ router }) => {
    return (
        <RouterProvider router={router}>
            <ThemeProvider theme={Theme}>
                <AppLayout />
            </ThemeProvider>
        </RouterProvider>
    );
};

export default AppContainer;
