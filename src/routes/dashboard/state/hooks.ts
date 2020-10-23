import { getUnixTime, parse, subDays, subHours } from 'date-fns';
import { dropRight, last, over, sortBy, times } from 'lodash';
import { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { BalancerData, BalancerResponse, BalancerState, EthereumBlock, HistoricalCGMarketChart, Option, TimePeriod } from '../../../api/datatypes';
import { EthBlockResponse, EthBlocksResponse, ETH_BLOCKS_SUBGRAPH_URL, useGraphQuery } from '../../../api/graphql';
import { DropdownOption } from '../../../components/design/dropdown/Dropdown';
import {
    BALANCER_CONTRACT_START_DATE,
    calculateRevenueRatio,
    calculateLiquidityUtilisation,
    getDates,
    TODAY,
    sortBlockKeys,
    calculateChange,
    getDynamicChange,
} from '../../../utils';
import { getBalancerPrice, getHistoricalBalancerPrice } from '../query/rest';

import blocksQuery from '../query/blocks.graphql';
import historicalBalancerQuery from '../query/historical.graphql';
import query from '../query/pools.graphql';

import numeral from 'numeral';

export type DataExtractorFn = (data: BalancerData | any, meta?: any) => number | unknown;

export const dataExtractors: Record<string, DataExtractorFn> = {
    totalLiquidity: data => parseFloat(data?.totalLiquidity),
    totalSwapVolume: data => parseFloat(data?.totalSwapVolume),
    totalSwapFeeVolume: data => parseFloat(data?.totalSwapFee),
    finalizedPoolCount: data => data?.finalizedPoolCount,
    privatePools: data => data?.poolCount - data?.finalizedPoolCount,
    balancerPrice: data => data?.balancerPrice || data,
    revenueRatio: (data, meta) => calculateRevenueRatio(data, meta?.chunkSize),
    liquidityUtilisation: (data, meta) => calculateLiquidityUtilisation(data, meta?.chunkSize),
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

    const historicalBalancerData: BalancerData[] | number[] = (historicalBalancerDataResponses || []).reduce(
        (data: BalancerData[], balancerResponse = {} as Record<string, BalancerData[]>) => {
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
            data.push(...(blocks as BalancerData[]));
            return data;
        },
        [] as unknown[]
    );

    return {
        isLoading,
        data: historicalBalancerData,
    };
};

export const useOverviewStatistics = (overviewPeriod: Option & { periodLength: number }) => {
    const startDate = subHours(TODAY, overviewPeriod?.periodLength);

    const dates = useMemo(() => {
        // this piece of code is not the best, as the function getDates 
        // requires you to provide a period length or a start date
        // due to the internals of getDates, when the value is 'day'
        // a start date is required, making the 2nd periodlength arg kind of useless
        // for that scenario
        return getDates({ value: overviewPeriod.value }, overviewPeriod?.periodLength, startDate);
    }, [startDate]);

    const { isLoading: isLoadingEthBlocks, blocks } = useEthTimestampBlocks(dates);
    const { data, isLoading: isLoadingHistoricalData } = useHistoricalBalancerState(blocks);
    const {
        values: historicalBalPrices,
        timestamps: historicalBalTimestamps,
        isLoading: isLoadingHistoricalBalPrices,
    } = useHistoricalBalancePrice(true, startDate);

    const balancerPrice = {
        yesterday: historicalBalPrices[0],
        today: last(historicalBalPrices),
        change: calculateChange(historicalBalPrices[0], last(historicalBalPrices)),
    }

    const totalLiquidity = getDynamicChange(data as BalancerData[])('totalLiquidity', overviewPeriod?.periodLength / 2);
    const feeVolume = getDynamicChange(data as BalancerData[])('totalSwapFeeVolume', overviewPeriod?.periodLength / 2);
    const swapVolume = getDynamicChange(data as BalancerData[])('totalSwapVolume', overviewPeriod?.periodLength / 2);
    const privatePools = getDynamicChange(data as BalancerData[])('privatePools', overviewPeriod?.periodLength / 2);
    const finalizedPoolCount = getDynamicChange(data as BalancerData[])('finalizedPoolCount', overviewPeriod?.periodLength / 2);

    // we request for double the actual amount of data for these 2 figures 
    // the chunk size is simply that total period divided 2.
    const utilisation = calculateLiquidityUtilisation(data as BalancerData[]);
    const revenueRatio = calculateRevenueRatio(data as BalancerData[]);

    return {
        totalLiquidity,
        feeVolume,
        swapVolume,
        privatePools,
        finalizedPoolCount,
        utilisation,
        revenueRatio,
        balancerPrice,
        isLoading: isLoadingHistoricalBalPrices || isLoadingHistoricalData || isLoadingEthBlocks,
    };
};

export const useHistoricalGraphState = (dataKey: DropdownOption, name: string, extractor?: DataExtractorFn) => {
    // default to start at 24 hour
    const [graphTimePeriod, setGraphTimePeriod] = useState({ value: 'day', label: 'day' });
    const dates = useMemo(() => getDates(graphTimePeriod), [graphTimePeriod.value]);

    // retrieve the ethereum blocks to get the timestamps for the data we need
    const { isLoading: isLoadingEthBlocks, blocks } = useEthTimestampBlocks(dates);

    let fromDate = graphTimePeriod?.value === 'day' ? BALANCER_CONTRACT_START_DATE : subHours(TODAY, 24);
    // get balancer usd prices, query disabled until till the datakey is balancer_usd
    const historicalBalancerPriceChartData = useHistoricalBalancePrice(dataKey?.value === 'balancerPrice', fromDate);

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
export const useHistoricalBalancePrice = (enabled: boolean, fromDate: Date) => {
    const { data: historicalBalPriceResponse, isLoading } = useQuery<HistoricalCGMarketChart>(
        [
            'historicalBalPrices',
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
