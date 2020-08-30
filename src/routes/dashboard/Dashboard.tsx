import React, { FC } from 'react';
import { useRouteNode } from 'react-router5';
import Box from '../../components/layout/box/Box';
import styled from 'styled-components';
import Card from '../../components/layout/card/Card';
import query from './query/pools.graphql';
import { useGraphQuery } from '../../api/graphql';
import bent from 'bent';

const StyledDashboard = styled(Box)`
    width: 100%;
    height: 100%;
    background: ${props => props.theme.background};
    display: grid;
    grid-template-columns: repeat(12, 55px);
    grid-column-gap: 2rem;
    grid-row-gap: 2rem;
    justify-content: center;
`;

const Dashboard: FC<any> = ({ children }) => {
    const { route } = useRouteNode('dashboard');
    const { data: response, isLoading } = useGraphQuery('pools', query);

    if (isLoading) return <span>'Loading data'</span>;
    const balancer = (response as any)?.data.balancer;
    return (
        <StyledDashboard>
            <Card spanX={4}>There are ${balancer.finalizedPoolCount} public pools</Card>
            <Card spanX={4}>There is ${balancer.totalLiquidity} total liquidity</Card>
            <Card spanX={4}>There is ${balancer.totalSwapFee} total swap fee</Card>
            <Card spanX={4}>There is ${balancer.totalSwapVolume} total swap volume</Card>
        </StyledDashboard>
    );
};

export default Dashboard;
