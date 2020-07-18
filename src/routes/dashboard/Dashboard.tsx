import React, { FC } from 'react';
import { useRouteNode } from 'react-router5';

const Dashboard: FC<any> = (props) => {
    const { route } = useRouteNode('dashboard');
    return (
        <div>This is Dashboard</div>
    );
}

export default Dashboard;