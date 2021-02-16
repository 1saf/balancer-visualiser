import React, { FC, Fragment, useMemo } from 'react';
import Heading from '../../components/design/heading/Heading';
import Box from '../../components/layout/box/Box';
import Statistic from '../../components/ui/statistic/Statistic';

import Eye from '../../assets/eye-solid.svg';
import EyeSlash from '../../assets/eye-slash-solid.svg';
import Exchange from '../../assets/exchange-alt-solid.svg';
import HoldingCash from '../../assets/hand-holding-usd-solid.svg';
import Pebbles from '../../assets/pebbles.svg';
import Lock from '../../assets/lock-solid.svg';

import { getDates } from '../../utils';
import { EthBlocksResponse, ETH_BLOCKS_SUBGRAPH_URL, useGraphQuery } from '../../api/graphql';
import { BalancerData, BalancerResponse, BalancerState } from '../../api/datatypes';

import { sortBy, takeRight } from 'lodash';
import numeral from 'numeral';

import blocksQuery from './query/blocks.graphql';
import historicalPoolsQuery from './query/historical.graphql';
import { useEthTimestampBlocks, useHistoricalBalancePrice, useHistoricalBalancerState } from './state/hooks';
import Skeleton30DGraphs from './Skeleton30DGraphs';

type Props = {
    balancerState: BalancerState;
};

const useHistoricalBalancerData = (historicalDataQuery: string) => {
    // default to start at 24 hour
    const dates = useMemo(() => getDates({ value: 'day', label: 'day' }), []);

    // retrieve the ethereum blocks to get the timestamps for the data we need
    // remember these queries get cached so calling them again will not cause
    // any overhead
    const { isLoading: isEthTimestampResponseLoading, blocks } = useEthTimestampBlocks(dates);

    // retrieve the data from balancer subgraph
    // remember these queries get cached so calling them again will not cause
    // any overhead
    const { data: historicalBalancerData, isLoading: isHistoricalBalancerResponseLoading } = useHistoricalBalancerState(blocks);

    console.log('esh', historicalBalancerData, isHistoricalBalancerResponseLoading );

    const timestamps = dates.map(r => r.first_ten);

    const isLoading = isEthTimestampResponseLoading || isHistoricalBalancerResponseLoading;

    const past30DaysData = takeRight(historicalBalancerData as BalancerData[], 30);
    const past30DaysTimestamps = takeRight(timestamps, 30);

    const historicalPublicPools = past30DaysData.map(d => d.finalizedPoolCount);
    const historicalPrivatePools = past30DaysData.map(d => d.poolCount - d.finalizedPoolCount);
    const historicalTotalSwapVolume = past30DaysData.map(d => d.totalSwapVolume);
    const historicalSwapFee = past30DaysData.map(d => d.totalSwapFee);
    const historicalValueLocked = past30DaysData.map(d => d.totalLiquidity);

    return {
        isLoading,
        data: historicalBalancerData,
        timestamps: past30DaysTimestamps,
        historicalPublicPools,
        historicalPrivatePools,
        historicalTotalSwapVolume,
        historicalSwapFee,
        historicalValueLocked,
    };
};

const Dashboard30DGraphs: FC<Props> = ({ balancerState }) => {
    const {
        isLoading: isHistoricalDataLoading,
        timestamps,
        historicalPrivatePools,
        historicalPublicPools,
        historicalSwapFee,
        historicalTotalSwapVolume,
        historicalValueLocked,
    } = useHistoricalBalancerData(historicalPoolsQuery);

    const {
        values: historicalBalPrices,
        timestamps: historicalBalTimestamps,
        isLoading: isLoadingHistoricalBalPrices,
    } = useHistoricalBalancePrice(true, { value: 'day', label: 'day' });

    const {
        totalLiquidity,
        totalSwapFee,
        totalSwapVolume,
        finalizedPoolCount,
        privatePools,
        balancerPrice,
        isLoading: isLoadingBalancerState,
    } = balancerState;

    const isLoading = isLoadingBalancerState || isHistoricalDataLoading || isLoadingHistoricalBalPrices;
    if (isLoading) return <Skeleton30DGraphs />;

    return (
        <Fragment>
            <Box spanX={12}>
                <Heading level='4'>30 days</Heading>
            </Box>
            <Statistic
                // icon={<Lock color='#3C3E4D' width='1.75rem' height='1.75rem' />}
                value={numeral(totalLiquidity).format('$(0.00a)')}
                heading='Total Value Locked'
                data={historicalValueLocked}
                timestamps={timestamps}
                description='The current total amount of liquidity on balancer in USD.'
            />
            <Statistic
                // icon={<Exchange color='#3C3E4D' width='1.75rem' height='1.75rem' />}
                value={numeral(totalSwapVolume).format('$(0.00a)')}
                heading='Total Swap Volume'
                data={historicalTotalSwapVolume}
                timestamps={timestamps}
                description='Total swaps done over all time in USD'
            />
            <Statistic
                // icon={<HoldingCash color='#3C3E4D' width='1.75rem' height='1.75rem' />}
                value={numeral(totalSwapFee).format('$(0.00a)')}
                heading='Total Fees'
                data={historicalSwapFee}
                timestamps={timestamps}
                description='Total fees captured over all time in USD'
            />
            <Statistic
                // icon={<Eye color='#3C3E4D' width='1.75rem' height='1.75rem' />}
                value={finalizedPoolCount}
                heading='Public Pools'
                data={historicalPublicPools}
                timestamps={timestamps}
                description='Total public pools with supplied liquidity.'
            />
            <Statistic
                // icon={<EyeSlash color='#3C3E4D' width='1.75rem' height='1.75rem' />}
                value={privatePools}
                heading='Private Pools'
                data={historicalPrivatePools}
                timestamps={timestamps}
                description='Total amount of private pools with supplied liquidity.'
            />
            <Statistic
                // icon={<Pebbles color='#3C3E4D' width='1.75rem' height='1.75rem' />}
                value={`$${balancerPrice}`}
                heading='BAL Price (USD)'
                data={historicalBalPrices}
                timestamps={historicalBalTimestamps}
            />
        </Fragment>
    );
};

export default Dashboard30DGraphs;
