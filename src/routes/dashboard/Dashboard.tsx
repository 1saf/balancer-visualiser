import React, { FC } from 'react';
import { useRouteNode } from 'react-router5';
import Box from '../../components/layout/box/Box';
import Stack from '../../components/layout/stack/Stack';

const Dashboard: FC<any> = ({ children }) => {
    const { route } = useRouteNode('dashboard');
    return (
        <Stack gap={['large', 'small']} orientation='horizontal'>
            <Box padding='base' paddingBottom={['small', 'x-large']}>
                This is dashboard
            </Box>
            <Box padding='small' paddingBottom={['small', 'x-large']}>
                This is dashboard
            </Box>
        </Stack>
    );
};

export default Dashboard;
