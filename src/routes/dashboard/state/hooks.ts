import { getUnixTime, subHours } from 'date-fns';
import { dropRight, sortBy, times } from 'lodash';
import { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { BalancerData, BalancerResponse, HistoricalCGMarketChart, TimePeriod } from '../../../api/datatypes';
import { EthBlocksResponse, ETH_BLOCKS_SUBGRAPH_URL, useGraphQuery } from '../../../api/graphql';
import { DropdownOption } from '../../../components/design/dropdown/Dropdown';
import { BALANCER_CONTRACT_START_DATE, getDates, TODAY } from '../../../utils';
import { getBalancerPrice, getHistoricalBalancerPrice } from '../query/rest';

import blocksQuery from '../query/blocks.graphql';
import historicalBalancerQuery from '../query/historical.graphql';
import query from '../query/pools.graphql';

import numeral from 'numeral';

type DataExtractorFn = (data: BalancerData | any) => number;

export const dataExtractors: Record<string, DataExtractorFn> = {
    totalLiquidity: data => parseFloat(data?.totalLiquidity),
    totalSwapVolume: data => parseFloat(data?.totalSwapVolume),
    totalSwapFeeVolume: data => parseFloat(data?.totalSwapFee),
    finalizedPoolCount: data => data?.finalizedPoolCount,
    privatePools: data => data?.poolCount - data?.finalizedPoolCount,
    balancerPrice: data => data?.balancerPrice || data,
};

export const dataFormats: Record<string, string> = {
    totalLiquidity: '$0,0.00a',
    totalSwapVolume: '$0,0.00a',
    totalSwapFeeVolume: '$0,0.00a',
    finalizedPoolCount: '0,0',
    privatePools: '0,0',
};

export const useEthTimestampBlocks = (dates: Date[]) => {
    const { data, isLoading, isFetching } = useGraphQuery<EthBlocksResponse>(['blockTimestamps', { requests: dates }], blocksQuery, {
        loop: true,
        graphEndpoint: ETH_BLOCKS_SUBGRAPH_URL,
    });

    return {
        isLoading,
        isFetching,
        data,
    };
};

export const useHistoricalGraphState = (dataKey: DropdownOption, name: string, extractor?: DataExtractorFn) => {
    // default to start at 24 hour
    const [graphTimePeriod, setGraphTimePeriod] = useState({ value: 'daily', label: 'Daily' });
    const dates = useMemo(() => getDates(graphTimePeriod), [graphTimePeriod.value]);

    // retrieve the ethereum blocks to get the timestamps for the data we need
    const { isLoading: isLoadingEthBlocks, data: ethBlocksResponse } = useEthTimestampBlocks(dates);

    // get balancer usd prices, query disabled until till the datakey is balancer_usd
    const historicalBalancerPriceChartData = useHistoricalBalancePrice(dataKey?.value === 'balancerPrice', graphTimePeriod);

    // parse the response data (its a string response) into numbers and sort
    // blocks are sorted by the timestamp they belong to
    const sortedBlocks = sortBy(
        (ethBlocksResponse || []).map(ethBlocks => {
            const blockTimestamp = ethBlocks?.data?.blocks[0];

            return {
                blockNumber: parseInt(blockTimestamp?.number, 10),
                blockTimestamp: parseInt(blockTimestamp?.timestamp, 10),
            };
        }),
        'blockTimestamp'
    );

    // retrieve historical data from the balancer subgraph
    const { data: historicalBalancerDataResponses, isLoading: isLoadingHistoricalBalancerData } = useGraphQuery<BalancerResponse[]>(
        ['historicalBlocks', { requests: sortedBlocks }],
        historicalBalancerQuery,
        {
            loop: true,
            enabled: sortedBlocks.length,
        }
    );

    // balancer usd relies on a different data fetch endpoint
    // return that instead if balancerPrice is requested
    if (dataKey?.value === 'balancerPrice')
        return {
            ...historicalBalancerPriceChartData,
            setGraphTimePeriod,
        };

    const historicalBalancerData = (historicalBalancerDataResponses || []).map(historicalBalancerResponse => {
        const data = (historicalBalancerResponse?.data?.balancer as any) || {};
        if (extractor) return extractor(data);
        return data[dataKey?.value];
    });

    const isLoading = isLoadingEthBlocks || isLoadingHistoricalBalancerData;
    return {
        isLoading,
        values: (historicalBalancerData || []).map(parseFloat),
        timestamps: dates.map(r => r.first_ten),
        name,
        setGraphTimePeriod,
    };
};

// retrieves balancer price in USD from the coingecko api
export const useHistoricalBalancePrice = (enabled: boolean, graphTimePeriod: TimePeriod) => {
    let fromDate = BALANCER_CONTRACT_START_DATE;
    if (graphTimePeriod?.value === 'hourly') fromDate = subHours(TODAY, 24);
    const { data: historicalBalPriceResponse, isLoading } = useQuery<HistoricalCGMarketChart>(
        [
            'historicalBalPrice',
            {
                from: getUnixTime(fromDate),
                to: getUnixTime(TODAY),
            },
        ],
        getHistoricalBalancerPrice,
        {
            enabled,
        }
    );

    const historicalBalPrices = (historicalBalPriceResponse?.prices || []).map(p => p[1]);
    const historicalBalTimestamps = (historicalBalPriceResponse?.prices || []).map(p => p[0] / 1000);
    return {
        values: historicalBalPrices,
        timestamps: historicalBalTimestamps,
        name: 'Balancer Price (USD)',
        isLoading,
    };
};

export const useBalancerMovementData = (dataKey: string, data: number[] = [], timestamps: number[] = []) => {
    // use single figure stats most recent data
    // this is needed so we can calculate accurate
    // volume for the current date e.g.
    // the current volume for today will be (latest - midnight)
    const latestData = useSingleFigureStatistics();

    // unfortunately have to be a ltitle cheeky here with the types
    const latestValue = dataExtractors[dataKey](latestData as any);

    if (!data.length || !timestamps.length) return {};

    const dailyData = data.map((value, i) => {
        if (i === data.length - 1) {
            const volume = latestValue - value;
            return [i, Math.abs(volume), volume > 0 ? 1 : -1];
        }
        const nextValue = data[i + 1];
        const volume = nextValue - value;
        return [i, Math.abs(volume), volume > 0 ? 1 : -1];
    });

    return {
        values: dailyData,
        axis: timestamps,
    };
};

export const useSingleFigureStatistics = () => {
    const { data: balancerStatsResponse, isLoading: isBalancerStatsLoading } = useGraphQuery<BalancerResponse>('pools', query);
    const { data: balPriceResponse, isLoading: isBalPriceRequestLoading } = useQuery('balPrice', getBalancerPrice);
    // const { data: ethPriceResponse, isLoading: isEthPriceRequestLoading } = useQuery('ethPrice', getEthPrice);

    const balancerStats = balancerStatsResponse?.data?.balancer;

    const totalPools = balancerStats?.poolCount; //
    const totalLiquidity = numeral(balancerStats?.totalLiquidity).value();
    const totalSwapVolume = numeral(balancerStats?.totalSwapVolume).value();
    const totalSwapFeeVolume = numeral(balancerStats?.totalSwapFee).value();
    const finalizedPoolCount = balancerStats?.finalizedPoolCount;
    const privatePools = totalPools - finalizedPoolCount;

    const balancerPrice = (balPriceResponse as any)?.market_data?.current_price?.usd;
    // const ethPrice = (ethPriceResponse as any)?.market_data?.current_price?.usd;

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
        balancerStatsResponse,
        // ethPrice,
    };
};
