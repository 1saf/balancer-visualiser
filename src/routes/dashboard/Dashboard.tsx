import React, { FC, useState, useMemo } from 'react';
import Box from '../../components/layout/box/Box';
import styled from 'styled-components';
import query from './query/pools.graphql';
import historicalPoolsQuery from './query/historical.graphql';
import { useGraphQuery, ETH_BLOCKS_SUBGRAPH_URL, GraphQLResponse } from '../../api/graphql';
import bent from 'bent';
import Heading from '../../components/design/heading/Heading';
import Statistic from '../../components/ui/statistic/Statistic';

import numeral from 'numeral';
import { useQuery } from 'react-query';
import { getBalancerPrice } from './query/rest';
import HistoricalBalancerGraph from './HistoricalBalancerGraph';

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

const useSingleFigureStatistics = () => {
    const { data: balancerStatsResponse, isLoading: isBalancerStatsLoading } = useGraphQuery<BalancerResponse>('pools', query);
    const { data: balPriceResponse, isLoading: isBalPriceRequestLoading } = useQuery('balPrice', getBalancerPrice);

    const balancerStats = balancerStatsResponse?.data?.balancer;

    const totalPools = balancerStats?.poolCount; //
    const totalLiquidity = numeral(balancerStats?.totalLiquidity).format('($0.00a)');
    const totalSwapVolume = numeral(balancerStats?.totalSwapVolume).format('($0.00a)');
    const totalSwapFeeVolume = numeral(balancerStats?.totalSwapFee).format('($0.00a)');
    const finalizedPoolCount = balancerStats?.finalizedPoolCount;
    const privatePools = totalPools - finalizedPoolCount;

    const balancerPrice = (balPriceResponse as any)?.market_data?.current_price?.usd;

    const isLoading = isBalPriceRequestLoading || isBalancerStatsLoading;

    return {
        totalPools,
        totalLiquidity,
        totalSwapVolume,
        totalSwapFeeVolume,
        privatePools,
        isLoading,
        finalizedPoolCount,
        balancerPrice,
    };
};

const Dashboard: FC<any> = ({ children }) => {
    const {
        totalLiquidity,
        totalSwapVolume,
        totalPools,
        finalizedPoolCount,
        totalSwapFeeVolume,
        privatePools,
        isLoading,
        balancerPrice,
    } = useSingleFigureStatistics();

    if (isLoading) return <span>'Loading data'</span>;
    return (
        <StyledDashboard>
            <Box spanX={12} paddingTop='x-large'>
                <Heading level='5'>
                    At a glance there is <EmphasizedText>{totalLiquidity}</EmphasizedText> of liquidity supplied across a total of
                    <EmphasizedText> {totalPools}</EmphasizedText> pools.
                </Heading>
            </Box>
            <Statistic heading='Public Pools'>{finalizedPoolCount}</Statistic>
            <Statistic heading='Total Swap Volume'>{totalSwapVolume}</Statistic>
            <Statistic heading='Total Swap Fee Volume'>{totalSwapFeeVolume}</Statistic>
            <Statistic heading='Private Pools'>{privatePools}</Statistic>
            <Statistic heading='Balancer Price (USD)'>${balancerPrice}</Statistic>

            <HistoricalBalancerGraph name='Total Value Locked' dataKey='totalLiquidity' query={historicalPoolsQuery} />
        </StyledDashboard>
    );
};

export default Dashboard;
