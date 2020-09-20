import React, { FC, useMemo } from 'react';
import Box from '../../components/layout/box/Box';
import styled from 'styled-components';
import query from './query/pools.graphql';
import blocksQuery from './query/blocks.graphql';
import historicalPoolsQuery from './query/historical.graphql';
import { useGraphQuery, ETH_BLOCKS_SUBGRAPH_URL, GraphQLResponse, EthBlocksResponse } from '../../api/graphql';
import Statistic from '../../components/ui/statistic/Statistic';

import numeral from 'numeral';
import { useQuery } from 'react-query';
import { getBalancerPrice, getHistoricalBalancerPrice, getEthPrice, getHistoricalEthPrice } from './query/rest';
import HistoricalBalancerGraph from './HistoricalBalancerGraph';
import { sortBy, last, takeRight } from 'lodash';
import { BalancerResponse, BalancerData, HistoricalCGMarketChart } from '../../api/datatypes';
import { getDates } from '../../utils';
import { subDays } from 'date-fns/esm';
import { getUnixTime } from 'date-fns';

import Eye from '../../assets/eye-solid.svg';
import EyeSlash from '../../assets/eye-slash-solid.svg';
import Exchange from '../../assets/exchange-alt-solid.svg';
import HoldingCash from '../../assets/hand-holding-usd-solid.svg';
import Pebbles from '../../assets/pebbles.svg';

import { tokens } from '../../style/Theme';
import Heading from '../../components/design/heading/Heading';

const today = new Date();

const StyledDashboard = styled(Box)`
    width: 100%;
    background: ${props => props.theme.background};
    display: grid;
    grid-template-columns: repeat(12, 75px);
    grid-column-gap: 1.5rem;
    grid-row-gap: 1.5rem;
    justify-content: center;
`;

const EmphasizedText = styled.em`
    color: ${props => props.theme.emphasizedText};
`;

const useSingleFigureStatistics = () => {
    const { data: balancerStatsResponse, isLoading: isBalancerStatsLoading } = useGraphQuery<BalancerResponse>('pools', query);
    const { data: balPriceResponse, isLoading: isBalPriceRequestLoading } = useQuery('balPrice', getBalancerPrice);
    const { data: ethPriceResponse, isLoading: isEthPriceRequestLoading } = useQuery('ethPrice', getEthPrice);

    const balancerStats = balancerStatsResponse?.data?.balancer;

    const totalPools = balancerStats?.poolCount; //
    const totalLiquidity = numeral(balancerStats?.totalLiquidity).format('($0.00a)');
    const totalSwapVolume = numeral(balancerStats?.totalSwapVolume).format('($0.00a)');
    const totalSwapFeeVolume = numeral(balancerStats?.totalSwapFee).format('($0.00a)');
    const finalizedPoolCount = balancerStats?.finalizedPoolCount;
    const privatePools = totalPools - finalizedPoolCount;

    const balancerPrice = (balPriceResponse as any)?.market_data?.current_price?.usd;
    const ethPrice = (ethPriceResponse as any)?.market_data?.current_price?.usd;

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
        ethPrice
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

    const past30DaysData = takeRight(historicalBalancerData, 30);
    const past30DaysTimestamps = takeRight(timestamps, 30);

    const historicalPublicPools = past30DaysData.map(d => d.finalizedPoolCount);
    const historicalPrivatePools = past30DaysData.map(d => d.poolCount - d.finalizedPoolCount);
    const historicalTotalSwapVolume = past30DaysData.map(d => parseFloat(d.totalSwapVolume));
    const historicalSwapFee = past30DaysData.map(d => parseFloat(d.totalSwapFee));
    const historicalValueLocked = past30DaysData.map(d => parseFloat(d.totalLiquidity));

    let past24HoursSwapFees
    let past24HoursSwapVolume
    let past24HoursLiquidityUtilisation
    let past24HoursRevenueRatio

    if (!isLoading && !isFetching) {
        console.log('here');
        past24HoursSwapFees = parseFloat(past30DaysData[29].totalSwapFee) - parseFloat(past30DaysData[0].totalSwapFee);
        past24HoursSwapVolume = parseFloat(past30DaysData[29].totalSwapVolume) - parseFloat(past30DaysData[0].totalSwapVolume);
    
        let past24HoursAverageLiquidity = past30DaysData.reduce((total, next) => parseFloat(total) + parseFloat(next.totalLiquidity), 0);
        past24HoursAverageLiquidity = past24HoursAverageLiquidity / 30;
    
        past24HoursLiquidityUtilisation = numeral(past24HoursSwapVolume / past24HoursAverageLiquidity).format('(0.00)%')
        past24HoursRevenueRatio = numeral(past24HoursSwapFees / past24HoursAverageLiquidity).format('(0.00)%')
    
        past24HoursSwapFees = numeral(past24HoursSwapFees).format('($0.00a)');
        past24HoursSwapVolume = numeral(past24HoursSwapVolume).format('($0.00a)');  
    }

    return {
        isLoading,
        isFetching,
        data: historicalBalancerData,
        timestamps: past30DaysTimestamps,
        historicalPublicPools,
        historicalPrivatePools,
        historicalTotalSwapVolume,
        historicalSwapFee,
        historicalValueLocked,
        past24HoursSwapFees,
        past24HoursSwapVolume,
        past24HoursLiquidityUtilisation,
        past24HoursRevenueRatio
    };
};

const useHistoricalBalancePrice = () => {
    const thirtyDaysAgo = subDays(today, 30);
    const { data: historicalBalPriceResponse, isLoading } = useQuery<HistoricalCGMarketChart>(
        [
            'historicalBalPrice',
            {
                from: getUnixTime(thirtyDaysAgo),
                to: getUnixTime(today),
            },
        ],
        getHistoricalBalancerPrice
    );

    const dailyData = (historicalBalPriceResponse?.prices || []).filter((_, i) => i % 24 == 0);

    const historicalBalPrices = dailyData.map(p => p[1]);
    const historicalBalTimestamps = dailyData.map(p => p[0] / 1000);
    return {
        historicalBalPrices,
        historicalBalTimestamps,
        isLoading,
    };
};

const useHistoricalEthPrice = () => {
    const thirtyDaysAgo = subDays(today, 30);
    const { data: historicalEthPriceResponse, isLoading } = useQuery<HistoricalCGMarketChart>(
        [
            'historicalEthPrice',
            {
                from: getUnixTime(thirtyDaysAgo),
                to: getUnixTime(today),
            },
        ],
        getHistoricalEthPrice
    );

    const dailyData = (historicalEthPriceResponse?.prices || []).filter((_, i) => i % 24 == 0);

    const historicalEthPrices = dailyData.map(p => p[1]);
    const historicalEthTimestamps = dailyData.map(p => p[0] / 1000);
    return {
        historicalEthPrices,
        historicalEthTimestamps,
        isLoading,
    };
};

const Dashboard: FC<any> = ({ children }) => {
    const {
        isLoading: isHistoricalDataLoading,
        timestamps,
        historicalPrivatePools,
        historicalPublicPools,
        historicalSwapFee,
        historicalTotalSwapVolume,
        historicalValueLocked,
        past24HoursSwapFees,
        past24HoursSwapVolume,
        past24HoursLiquidityUtilisation,
        past24HoursRevenueRatio
    } = useHistoricalBalancerData(historicalPoolsQuery);

    const {
        isLoading: isSingleFigureLoading,
        totalLiquidity,
        privatePools,
        totalSwapFeeVolume,
        totalSwapVolume,
        finalizedPoolCount,
        balancerPrice,
        ethPrice,
    } = useSingleFigureStatistics();

    const { historicalBalPrices, historicalBalTimestamps, isLoading: isLoadingHistoricalBalPrices } = useHistoricalBalancePrice();
    const { historicalEthPrices, historicalEthTimestamps, isLoading: isLoadingHistoricalEthPrices } = useHistoricalEthPrice();

    if (isHistoricalDataLoading || isSingleFigureLoading || isLoadingHistoricalBalPrices || isLoadingHistoricalEthPrices) return <span>'Loading data'</span>;

    return (
        <StyledDashboard paddingY='large'>
            <Box spanX={12}>
                <Heading level='2'>Quick Statistics</Heading>
            </Box>
            <Statistic
                colors={[tokens.colors.congo_pink, tokens.colors.ultramarine]}
                icon={<Eye color='#3C3E4D' width='1.75rem' height='1.75rem' />}
                value={finalizedPoolCount}
                heading='Public Pools'
                data={historicalPublicPools}
                timestamps={timestamps}
                description='Total public pools with supplied liquidity.'
            />
            <Statistic
                colors={[tokens.colors.congo_pink, tokens.colors.ultramarine]}
                icon={<EyeSlash color='#3C3E4D' width='1.75rem' height='1.75rem' />}
                value={privatePools}
                heading='Private Pools'
                data={historicalPrivatePools}
                timestamps={timestamps}
                description='Total amount of private pools with supplied liquidity.'
            />
            <Statistic
                colors={[tokens.colors.congo_pink, tokens.colors.ultramarine]}
                icon={<EyeSlash color='#3C3E4D' width='1.75rem' height='1.75rem' />}
                value={totalLiquidity}
                heading='Total Value Locked'
                data={historicalValueLocked}
                timestamps={timestamps}
                description='The current total amount of liquidity on balancer in USD.'
            />
            <Statistic
                colors={[tokens.colors.congo_pink, tokens.colors.ultramarine]}
                icon={<Exchange color='#3C3E4D' width='1.75rem' height='1.75rem' />}
                value={totalSwapVolume}
                heading='Total Swap Volume'
                data={historicalTotalSwapVolume}
                timestamps={timestamps}
            />
            <Statistic
                colors={[tokens.colors.congo_pink, tokens.colors.ultramarine]}
                icon={<HoldingCash color='#3C3E4D' width='1.75rem' height='1.75rem' />}
                value={totalSwapFeeVolume}
                heading='Total Fee Volume'
                data={historicalSwapFee}
                timestamps={timestamps}
            />
            <Statistic
                colors={[tokens.colors.congo_pink, tokens.colors.ultramarine]}
                icon={<Pebbles color='#3C3E4D' width='1.75rem' height='1.75rem' />}
                value={`$${balancerPrice}`}
                heading='Balancer Price (USD)'
                data={historicalBalPrices}
                timestamps={historicalBalTimestamps}
            />
            <Statistic
                colors={[tokens.colors.congo_pink, tokens.colors.ultramarine]}
                icon={<Pebbles color='#3C3E4D' width='1.75rem' height='1.75rem' />}
                value={`$${ethPrice}`}
                heading='Ethereum Price (USD)'
                data={historicalEthPrices}
                timestamps={historicalEthTimestamps}
            />
            <Box spanX={12}>
                <Heading level='2'>Past 24 Hours</Heading>
            </Box>
            <Statistic
                colors={[tokens.colors.congo_pink, tokens.colors.ultramarine]}
                icon={<HoldingCash color='#3C3E4D' width='1.75rem' height='1.75rem' />}
                value={past24HoursSwapFees}
                heading='Total Fees Past 24 Hours'
                data={null}
                timestamps={timestamps}
            />
            <Statistic
                colors={[tokens.colors.congo_pink, tokens.colors.ultramarine]}
                icon={<Exchange color='#3C3E4D' width='1.75rem' height='1.75rem' />}
                value={past24HoursSwapVolume}
                heading='Total Swap Volume Past 24 Hours'
                data={null}
                timestamps={timestamps}
            />
            <Statistic
                colors={[tokens.colors.congo_pink, tokens.colors.ultramarine]}
                icon={<HoldingCash color='#3C3E4D' width='1.75rem' height='1.75rem' />}
                value={past24HoursLiquidityUtilisation}
                heading='Liquidity Utilisation Past 24 Hours'
                data={null}
                timestamps={timestamps}
                description='Trading volume from past 24 hours divided by hourly average liquidity'
            />
            <Statistic
                colors={[tokens.colors.congo_pink, tokens.colors.ultramarine]}
                icon={<Exchange color='#3C3E4D' width='1.75rem' height='1.75rem' />}
                value={past24HoursRevenueRatio}
                heading='Revenue Ratio Past 24 Hours'
                data={null}
                timestamps={timestamps}
                description='Fees from past 24 hours divided by hourly average liquidity'
            />

            <Box spanX={12}>
                <Heading level='2'>In-Depth Statistics</Heading>
            </Box>
            <HistoricalBalancerGraph dataKey='totalLiquidity' query={historicalPoolsQuery} />
        </StyledDashboard>
    );
};

export default Dashboard;
