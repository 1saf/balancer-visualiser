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
import { useQuery } from 'react-query';
import { getBalancerPrice } from './query/rest';

const StyledDashboard = styled(Box)`
    width: 100%;
    background: ${props => props.theme.background};
    display: grid;
    grid-template-columns: repeat(12, 75px);
    grid-column-gap: 1rem;
    grid-row-gap: 1rem;
    justify-content: center;
`;

const EmphasizedText = styled.em`
    color: ${props => props.theme.emphasizedText};
`;

const Dashboard: FC<any> = ({ children }) => {
    const { route } = useRouteNode('dashboard');

    const { data: balancerStatsResponse, isLoading: isBalancerStatsLoading } = useGraphQuery('pools', query);
    const { data: balPriceResponse, isLoading: isBalPriceRequestLoading } = useQuery('balPrice', getBalancerPrice);

    if (isBalancerStatsLoading || isBalPriceRequestLoading) return <span>'Loading data'</span>;
    const balancerStats = (balancerStatsResponse as any)?.data.balancer;

    const totalPools = balancerStats?.poolCount;
    const totalLiquidity = numeral(balancerStats?.totalLiquidity).format('($0.00a)');
    const totalSwapVolume = numeral(balancerStats?.totalSwapVolume).format('($0.00a)');
    const totalSwapFeeVolume = numeral(balancerStats?.totalSwapFee).format('($0.00a)');
    const privatePools = totalPools - balancerStats?.finalizedPoolCount;

    return (
        <StyledDashboard>
            <Box spanX={12} paddingTop='x-large'>
                <Heading level='5'>
                    At a glance there is <EmphasizedText>{totalLiquidity}</EmphasizedText> of liquidity supplied across a total of
                    <EmphasizedText> {totalPools}</EmphasizedText> pools.
                </Heading>
            </Box>
            <Statistic heading='Public Pools'>{balancerStats?.finalizedPoolCount}</Statistic>
            <Statistic heading='Total Swap Volume'>{totalSwapVolume}</Statistic>
            <Statistic heading='Total Swap Fee Volume'>{totalSwapFeeVolume}</Statistic>
            <Statistic heading='Private Pools'>{privatePools}</Statistic>
            <Statistic heading='Balancer Price (USD)'>${(balPriceResponse as any)?.market_data?.current_price?.usd}</Statistic>
        </StyledDashboard>
    );
};

export default Dashboard;
