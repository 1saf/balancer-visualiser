import React, { FC, useState, useMemo } from 'react';
import Box from '../../components/layout/box/Box';
import styled from 'styled-components';
import query from './query/pools.graphql';
import blocksQuery from './query/blocks.graphql';
import historicalPoolsQuery from './query/historical.graphql';
import { useGraphQuery, ETH_BLOCKS_SUBGRAPH_URL, GraphQLResponse } from '../../api/graphql';
import bent from 'bent';
import Heading from '../../components/design/heading/Heading';
import Statistic from '../../components/ui/statistic/Statistic';

import numeral from 'numeral';
import { useQuery } from 'react-query';
import { getBalancerPrice } from './query/rest';
import LineGraph from '../../components/ui/graph/LineGraph';
import { subMonths, endOfMonth, getTime, getUnixTime, addMinutes, format as formatDate, subDays, endOfDay } from 'date-fns';
import { sortBy } from 'lodash';

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

type BalancerResponse = GraphQLResponse<{
    balancer: {
        finalizedPoolCount: number;
        poolCount: number;
        totalLiquidity: string;
        totalSwapFee: string;
        totalSwapVolume: string;
    };
}>;
const useSingleFigureStatistics = () => {
    const { data: balancerStatsResponse, isLoading: isBalancerStatsLoading } = useGraphQuery<BalancerResponse>('pools', query);
    const { data: balPriceResponse, isLoading: isBalPriceRequestLoading } = useQuery('balPrice', getBalancerPrice);

    const balancerStats = balancerStatsResponse?.data?.balancer;

    const totalPools = balancerStats?.poolCount;//
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

const getDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 90; i++) {
        const endOfMonthDate = endOfDay(subDays(today, i));
        dates.push({
            first_ten: getUnixTime(endOfMonthDate),
            last_ten: getUnixTime(addMinutes(endOfMonthDate, 10)),
            date: formatDate(endOfMonthDate, 'yyyy-MM-dd'),
        });
    }

    return dates.reverse();
};

type EthBlocksResponse = GraphQLResponse<{ blocks: { id: string; number: string; timestamp: string }[] }>[];

const useGraphStatistics = () => {
    const requests = useMemo(() => getDates(), []);
    const { data: blockTimestampsResponses, isLoading: isEthTimestampResponseLoading } = useGraphQuery<EthBlocksResponse>(['blockTimestamps', { requests }], blocksQuery, {
        loop: true,
        graphEndpoint: ETH_BLOCKS_SUBGRAPH_URL,
    });

    const sortedBlockNumbers = sortBy(
        (blockTimestampsResponses || []).map(blockTimestampResponse => {
            const blockTimestamp = blockTimestampResponse?.data?.blocks[0];
            return {
                blockNumber: parseInt(blockTimestamp.number, 10),
                blockTimestamp: parseInt(blockTimestamp.timestamp, 10),
            };
        }),
        'blockTimestamp'
    );

    const { data: historicalBalancerResponses, isLoading: isHistoricalBalancerResponseLoading } = useGraphQuery<BalancerResponse[]>(
        ['historicalBlocks', { requests: sortedBlockNumbers }],
        historicalPoolsQuery,
        { loop: true, enabled: sortedBlockNumbers.length }
    );

    const historicalBalancerData = (historicalBalancerResponses || []).map(historicalBalancerResponse => {
        const { finalizedPoolCount, totalLiquidity, totalSwapFee, totalSwapVolume, poolCount } = historicalBalancerResponse?.data?.balancer;
        return {
            finalizedPoolCount,
            totalLiquidity,
            totalSwapFee,
            totalSwapVolume,
            poolCount,
        };
    });

    const chartData = {
        values: (historicalBalancerData || []).map(d => parseFloat(d.totalLiquidity)),
        axis: requests.map(r => r.first_ten),
        name: 'TVL',
    };

    return { chartData, isLoading: isEthTimestampResponseLoading || isHistoricalBalancerResponseLoading  };
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

    const { chartData, isLoading: bLoading } = useGraphStatistics();

    if (isLoading || bLoading) return <span>'Loading data'</span>;
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

            <LineGraph data={chartData} legend={['TVL']} title='TVL (6 months) - Design is WIP' />
        </StyledDashboard>
    );
};

export default Dashboard;
