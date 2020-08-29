import React, { FC } from 'react';
import { useRouteNode } from 'react-router5';
import Box from '../../components/layout/box/Box';

const Dashboard: FC<any> = ({ children }) => {
    const { route } = useRouteNode('dashboard');
    return (
        <Box>This is dashboard</Box>
    );
}

export default Dashboard;