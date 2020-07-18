import React, { FC } from 'react';
import { useRouteNode } from 'react-router5';

const Dashboard: FC<any> = ({ children }) => {
    const { route } = useRouteNode('dashboard');
    return (
        <div>
            This is Dashboard
            { children }
        </div>
    );
}

export default Dashboard;