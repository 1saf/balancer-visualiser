import React, { FC } from 'react';
import { RouterProvider } from 'react-router5';
import AppLayout from '../layouts/AppLayout';

type Props = {
    router?: any;
}

const AppContainer: FC<Props> = ({ router }) => {
    return (
        <RouterProvider router={router}>
            <AppLayout />
        </RouterProvider>
    );
}

export default AppContainer;