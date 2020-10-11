import { getUnixTime, parse, subHours } from 'date-fns';
import { dropRight, sortBy, times } from 'lodash';
import { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { BalancerData, BalancerResponse, BalancerState, EthereumBlock, HistoricalCGMarketChart, TimePeriod } from '../../../api/datatypes';
import { EthBlockResponse, EthBlocksResponse, ETH_BLOCKS_SUBGRAPH_URL, useGraphQuery } from '../../../api/graphql';
import { DropdownOption } from '../../../components/design/dropdown/Dropdown';
import {
    BALANCER_CONTRACT_START_DATE,
    calculateRevenueRatio,
    get24Change,
    calculateLiquidityUtilisation,
    getDates,
    TODAY,
    sortBlockKeys,
} from '../../../utils';
import { getBalancerPrice, getHistoricalBalancerPrice } from '../query/rest';

import blocksQuery from '../query/blocks.graphql';
import historicalBalancerQuery from '../query/historical.graphql';
import query from '../query/pools.graphql';

import numeral from 'numeral';

export type DataExtractorFn = (data: BalancerData | any) => number | unknown;

export const dataExtractors: Record<string, DataExtractorFn> = {
    totalLiquidity: data => parseFloat(data?.totalLiquidity),
    totalSwapVolume: data => parseFloat(data?.totalSwapVolume),
    totalSwapFeeVolume: data => parseFloat(data?.totalSwapFee),
    finalizedPoolCount: data => data?.finalizedPoolCount,
    privatePools: data => data?.poolCount - data?.finalizedPoolCount,
    balancerPrice: data => data?.balancerPrice || data,
    revenueRatio: data => calculateRevenueRatio(data),
    liquidityUtilisation: data => calculateLiquidityUtilisation(data),
};

export const dataFormats: Record<string, string> = {
    totalLiquidity: '$0,0.00a',
    totalSwapVolume: '$0,0.00a',
    totalSwapFeeVolume: '$0,0.00a',
    finalizedPoolCount: '0,0',
    privatePools: '0,0',
};

export const useEthTimestampBlocks = (dates: Date[]) => {
    const { data: blocksResponse, isLoading, isFetching } = useGraphQuery<any>(['blockTimestamps', { requests: dates }], blocksQuery, {
        loop: true,
        graphEndpoint: ETH_BLOCKS_SUBGRAPH_URL,
    });

    // parse the response data (its a string response) into numbers and sort
    // blocks are sorted by the timestamp they belong to

    // look, the complexity here isn't ideal O(n^2) but we gotta work with
    // what we got. this code should be obsolete once this sort of
    // data is retrieve via the subgraph completely
    const sortedBlocks = sortBy(
        (blocksResponse || []).reduce((data: EthereumBlock[], ethBlocks = {} as Record<string, EthBlockResponse[]>) => {
            const blocks = sortBlockKeys(Object.keys(ethBlocks)).reduce((parsedBlocks, blockKey) => {
                const block = ethBlocks[blockKey][0];
                parsedBlocks.push({
                    blockNumber: parseInt(block?.number, 10),
                    blockTimestamp: parseInt(block?.timestamp, 10),
                });
                return parsedBlocks;
            }, [] as EthereumBlock[]);
            data.push(...blocks);
            return data;
        }, [] as EthereumBlock[]),
        'blockTimestamp'
    );

    return {
        isLoading,
        isFetching,
        rawData: blocksResponse,
        blocks: sortedBlocks,
    };
};

export const useHistoricalBalancerState = (blocks: EthereumBlock[], dataExtractor?: DataExtractorFn | string) => {
    // retrieve historical data from the balancer subgraph

    const { data: historicalBalancerDataResponses, isLoading } = useGraphQuery<any>(
        ['historicalBlocks', { requests: blocks }],
        historicalBalancerQuery,
        {
            loop: true,
            enabled: blocks.length,
        }
    );

    const historicalBalancerData: BalancerData[] | number[] = (historicalBalancerDataResponses || []).reduce((data: BalancerData[], balancerResponse = {} as Record<string, BalancerData[]>) => {
        const blocks = sortBlockKeys(Object.keys(balancerResponse)).reduce((parsedBlocks, blockKey) => {
            const block = balancerResponse[blockKey];
            if (typeof dataExtractor === 'function' && dataExtractor) {
                parsedBlocks.push(dataExtractor(block));
                return parsedBlocks;
            }
            if (typeof dataExtractor === 'string' && dataExtractor) {
                parsedBlocks.push((block as any)[dataExtractor as string]);
                return parsedBlocks;
            }
            parsedBlocks.push(block);

            return parsedBlocks;
        }, [] as unknown[]);
        data.push(...blocks as BalancerData[]);
        return data;
    }, [] as unknown[]);

    return {
        isLoading,
        data: historicalBalancerData,
    };
};

export const use24HourStatistics = () => {
    const dates = useMemo(() => getDates({ value: 'hourly' }, 48), []);

    const { isLoading: isLoadingEthBlocks, blocks } = useEthTimestampBlocks(dates);
    const { data, isLoading: isLoadingHistoricalData } = useHistoricalBalancerState(blocks);

    const liquidityVolume = get24Change(data)('totalLiquidity');
    const feeVolume = get24Change(data)('totalSwapFeeVolume');
    const swapVolume = get24Change(data)('totalSwapVolume');
    const privatePoolsVolume = get24Change(data)('privatePools');
    const finalizedPoolCountVolume = get24Change(data)('finalizedPoolCount');

    const utilisation = calculateLiquidityUtilisation(data);
    const revenueRatio = calculateRevenueRatio(data);

    return {
        liquidityVolume,
        feeVolume,
        swapVolume,
        privatePoolsVolume,
        finalizedPoolCountVolume,
        utilisation,
        revenueRatio,
    };
};

export const useHistoricalGraphState = (dataKey: DropdownOption, name: string, extractor?: DataExtractorFn) => {
    // default to start at 24 hour
    const [graphTimePeriod, setGraphTimePeriod] = useState({ value: 'daily', label: 'Daily' });
    const dates = useMemo(() => getDates(graphTimePeriod), [graphTimePeriod.value]);

    // retrieve the ethereum blocks to get the timestamps for the data we need
    const { isLoading: isLoadingEthBlocks, blocks } = useEthTimestampBlocks(dates);

    // get balancer usd prices, query disabled until till the datakey is balancer_usd
    const historicalBalancerPriceChartData = useHistoricalBalancePrice(dataKey?.value === 'balancerPrice', graphTimePeriod);

    // retrieve historical data from the balancer subgraph
    const { data: historicalBalancerData, isLoading: isLoadingHistoricalBalancerData } = useHistoricalBalancerState(
        blocks,
        extractor || dataKey?.value
    );

    // balancer usd relies on a different data fetch endpoint
    // return that instead if balancerPrice is requested
    if (dataKey?.value === 'balancerPrice')
        return {
            ...historicalBalancerPriceChartData,
            setGraphTimePeriod,
        };

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

export const useCurrentBalancerStatistics = () => {
    const { data: balancerStatsResponse, isLoading: isBalancerStatsLoading } = useGraphQuery<BalancerResponse>('pools', query);
    const { data: balPriceResponse, isLoading: isBalPriceRequestLoading } = useQuery('balPrice', getBalancerPrice);

    const balancerStats = balancerStatsResponse?.data?.balancer;

    const poolCount = balancerStats?.poolCount; //
    const totalLiquidity = numeral(balancerStats?.totalLiquidity).value();
    const totalSwapVolume = numeral(balancerStats?.totalSwapVolume).value();
    const totalSwapFee = numeral(balancerStats?.totalSwapFee).value();
    const finalizedPoolCount = balancerStats?.finalizedPoolCount;
    const privatePools = poolCount - finalizedPoolCount;

    const balancerPrice = (balPriceResponse as any)?.market_data?.current_price?.usd;

    const isLoading = isBalPriceRequestLoading || isBalancerStatsLoading;

    return {
        poolCount,
        totalLiquidity,
        totalSwapVolume,
        totalSwapFee,
        privatePools,
        isLoading,
        finalizedPoolCount,
        balancerPrice,
    };
};

export const useBalancerMovementData = (dataKey: string, data: number[] = [], timestamps: number[] = []) => {
    // use single figure stats most recent data
    // this is needed so we can calculate accurate
    // volume for the current date e.g.
    // the current volume for today will be (latest - midnight)
    const latestData = useCurrentBalancerStatistics();

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
