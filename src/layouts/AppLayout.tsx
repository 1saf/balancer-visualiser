import React, { FC } from 'react';
import NotFound from '../routes/not-found/NotFound';
import { useRouteNode } from 'react-router5';
import Dashboard from '../routes/dashboard/Dashboard';

const AppLayout: FC<any> = (props) => {
    const { route } = useRouteNode('');
    const topRouteName = route?.name?.split('.')[0];

    if (topRouteName == 'dashboard') return <Dashboard />;
    return <NotFound />
}

export default AppLayout;