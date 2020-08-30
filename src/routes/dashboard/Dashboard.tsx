import React, { FC } from 'react';
import { useRouteNode } from 'react-router5';
import Box from '../../components/layout/box/Box';
import styled from 'styled-components';
import Card from '../../components/layout/card/Card';
import query from './query/pools.graphql';
import { useGraphQuery } from '../../api/graphql';
import bent from 'bent';
import Heading from '../../components/design/heading/Heading';
import Statistic from '../../components/ui/statistic/Statistic';

import numeral from 'numeral';

const StyledDashboard = styled(Box)`
    width: 100%;
    background: ${props => props.theme.background};
    display: grid;
    grid-template-columns: repeat(12, 55px);
    grid-column-gap: 2rem;
    grid-row-gap: 1rem;
    justify-content: center;
`;

const EmphasizedText = styled.em`
    color: ${props => props.theme.emphasizedText};
`;

const Dashboard: FC<any> = ({ children }) => {
    const { route } = useRouteNode('dashboard');

    const { data: response, isLoading } = useGraphQuery('pools', query);

    if (isLoading) return <span>'Loading data'</span>;
    const balancerStats = (response as any)?.data.balancer;

    console.log('stats', balancerStats);

    const totalPools = balancerStats?.poolCount;
    const totalLiquidity = numeral(balancerStats?.totalLiquidity).format('($0.00a)');
    const totalSwapVolume = numeral(balancerStats?.totalSwapVolume).format('($0.00a)');
    const totalSwapFeeVolume = numeral(balancerStats?.totalSwapFee).format('($0.00a)');
    return (
        <StyledDashboard>
            <Box spanX={12}>
                <Heading level='5'>
                    At a glance there is <EmphasizedText>{totalLiquidity}</EmphasizedText> of liquidity supplied across a total of
                    <EmphasizedText> {totalPools}</EmphasizedText> pools.
                </Heading>
            </Box>
            <Statistic heading='Public Pools'>{balancerStats?.finalizedPoolCount}</Statistic>
            <Statistic heading='Total Swap Volume'>{totalSwapVolume}</Statistic>
            <Statistic heading='Total Swap Fee Volume'>{totalSwapFeeVolume}</Statistic>
        </StyledDashboard>
    );
};

export default Dashboard;
