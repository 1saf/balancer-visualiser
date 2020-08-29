import React, { FC } from 'react';
import { useRouteNode } from 'react-router5';
import Box from '../../components/layout/box/Box';
import styled from 'styled-components';
import Card from '../../components/layout/card/Card';

const StyledDashboard = styled(Box)`
    width: 100%;
    height: 100%;
    background: ${props => props.theme.background};
    display: grid;
    grid-template-columns: repeat(12, 55px);
    grid-column-gap: 2rem;
    justify-content: center;
`;

const Dashboard: FC<any> = ({ children }) => {
    const { route } = useRouteNode('dashboard');
    return (
        <StyledDashboard>
            <Card>h</Card>
        </StyledDashboard>
    );
};

export default Dashboard;
