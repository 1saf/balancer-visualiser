import React, { FC, useState, useMemo } from 'react';
import Box from '../../components/layout/box/Box';
import styled from 'styled-components';
import query from './query/pools.graphql';
import blocksQuery from './query/blocks.graphql';
import historicalPoolsQuery from './query/historical.graphql';
import { useGraphQuery, ETH_BLOCKS_SUBGRAPH_URL, GraphQLResponse, EthBlocksResponse } from '../../api/graphql';
import bent from 'bent';
import Heading from '../../components/design/heading/Heading';
import Statistic from '../../components/ui/statistic/Statistic';

import numeral from 'numeral';
import { useQuery } from 'react-query';
import { getBalancerPrice, getHistoricalBalancerPrice } from './query/rest';
import HistoricalBalancerGraph from './HistoricalBalancerGraph';
import { sortBy, last } from 'lodash';
import { BalancerResponse, BalancerData, HistoricalCGMarketChart } from '../../api/datatypes';
import { getDates } from '../../utils';
import { subDays } from 'date-fns/esm';
import { getUnixTime } from 'date-fns';

const today = new Date();

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

const useHistoricalBalancerData = (historicalDataQuery: string) => {
    // default to start at 24 hour
    const requests = useMemo(() => getDates({ value: 'daily', label: 'Daily' }), []);

    // retrieve the ethereum blocks to get the timestamps for the data we need
    const {
        data: blockTimestampsResponses,
        isLoading: isEthTimestampResponseLoading,
        isFetching: isEthTimestampResponseFetching,
    } = useGraphQuery<EthBlocksResponse>(['blockTimestamps', { requests }], blocksQuery, {
        loop: true,
        graphEndpoint: ETH_BLOCKS_SUBGRAPH_URL,
    });

    // parse the response data (its a string response) into numbers and sort
    const sortedBlockNumbers = sortBy(
        (blockTimestampsResponses || []).map(blockTimestampResponse => {
            const blockTimestamp = blockTimestampResponse?.data?.blocks[0];

            return {
                blockNumber: parseInt(blockTimestamp?.number, 10),
                blockTimestamp: parseInt(blockTimestamp?.timestamp, 10),
            };
        }),
        'blockTimestamp'
    );

    // retrieve the data from balancer subgraph
    const {
        data: historicalBalancerResponses,
        isLoading: isHistoricalBalancerResponseLoading,
        isFetching: isHistoricalBalancerResponseFetching,
    } = useGraphQuery<BalancerResponse[]>(['historicalBlocks', { requests: sortedBlockNumbers }], historicalDataQuery, {
        loop: true,
        enabled: sortedBlockNumbers.length,
    });

    const timestamps = requests.map(r => r.first_ten);

    const historicalBalancerData: BalancerData[] = (historicalBalancerResponses || []).map(historicalBalancerResponse => {
        return historicalBalancerResponse?.data?.balancer || ({} as BalancerData);
    });

    const isLoading = isEthTimestampResponseLoading || isHistoricalBalancerResponseLoading;
    const isFetching = isEthTimestampResponseFetching || isHistoricalBalancerResponseFetching;

    const past30DaysData = historicalBalancerData.slice(1).slice(-30);
    const past30DaysTimestamps = timestamps.slice(1).slice(-30);

    const historicalPublicPools = past30DaysData.map(d => d.finalizedPoolCount);
    const historicalPrivatePools = past30DaysData.map(d => d.poolCount - d.finalizedPoolCount);
    const historicalTotalSwapVolume = past30DaysData.map(d => d.totalSwapVolume);
    const historicalSwapFee = past30DaysData.map(d => d.totalSwapFee);

    return {
        isLoading,
        isFetching,
        data: historicalBalancerData,
        timestamps: past30DaysTimestamps,
        historicalPublicPools,
        historicalPrivatePools,
        historicalTotalSwapVolume,
        historicalSwapFee,
    };
};

const useHistoricalBalancePrice = () => {
    const thirtyDaysAgo = subDays(today, 30);
    const { data: historicalBalPriceResponse, isLoading } = useQuery<HistoricalCGMarketChart>(['historicalBalPrice', {
        from: getUnixTime(thirtyDaysAgo),
        to: getUnixTime(today),
    }], getHistoricalBalancerPrice);

    const dailyData = (historicalBalPriceResponse?.prices || []).filter((_,i) => i % 24 == 0); 

    const historicalBalPrices = dailyData.map((p) => p[1]);
    const historicalBalTimestamps = dailyData.map((p) => p[1]);
    return {
        historicalBalPrices,
        historicalBalTimestamps,
        isLoading,
    }
}

const Dashboard: FC<any> = ({ children }) => {
    const {
        isLoading: isHistoricalDataLoading,
        timestamps,
        historicalPrivatePools,
        historicalPublicPools,
        historicalSwapFee,
        historicalTotalSwapVolume,
    } = useHistoricalBalancerData(historicalPoolsQuery);

    const {
        isLoading: isSingleFigureLoading,
        totalLiquidity,
        totalPools,
        privatePools,
        totalSwapFeeVolume,
        totalSwapVolume,
        finalizedPoolCount,
        balancerPrice,
    } = useSingleFigureStatistics();

    const {
        historicalBalPrices,
        historicalBalTimestamps,
        isLoading: isLoadingHistoricalBalPrices,
    } = useHistoricalBalancePrice();

    if (isHistoricalDataLoading || isSingleFigureLoading || isLoadingHistoricalBalPrices) return <span>'Loading data'</span>;

    return (
        <StyledDashboard>
            <Box spanX={12} paddingTop='x-large'>
                <Heading level='5'>
                    At a glance there is <EmphasizedText>{totalLiquidity}</EmphasizedText> of liquidity supplied across a total of
                    <EmphasizedText> {totalPools}</EmphasizedText> pools.
                </Heading>
            </Box>
            <Statistic value={finalizedPoolCount} heading='Public Pools' data={historicalPublicPools} timestamps={timestamps} />
            <Statistic value={totalSwapVolume} heading='Total Swap Volume' data={historicalTotalSwapVolume} timestamps={timestamps} />
            <Statistic value={totalSwapFeeVolume} heading='Total Swap Fee Volume' data={historicalSwapFee} timestamps={timestamps} />
            <Statistic value={privatePools} heading='Private Pools' data={historicalPrivatePools} timestamps={timestamps} />
            <Statistic value={`$${balancerPrice}`} heading='Balancer Price (USD)' data={historicalBalPrices} timestamps={historicalBalTimestamps} />

            <HistoricalBalancerGraph name='Total Value Locked' dataKey='totalLiquidity' queryLiteral={historicalPoolsQuery} />
        </StyledDashboard>
    );
};

export default Dashboard;
