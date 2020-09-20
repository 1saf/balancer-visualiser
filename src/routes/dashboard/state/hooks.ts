import { getUnixTime, subHours } from 'date-fns';
import { dropRight, sortBy } from 'lodash';
import { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { BalancerData, BalancerResponse, HistoricalCGMarketChart, TimePeriod } from '../../../api/datatypes';
import { EthBlocksResponse, ETH_BLOCKS_SUBGRAPH_URL, useGraphQuery } from '../../../api/graphql';
import { DropdownOption } from '../../../components/design/dropdown/Dropdown';
import { BALANCER_CONTRACT_START_DATE, getDates, TODAY } from '../../../utils';
import { getHistoricalBalancerPrice } from '../query/rest';

import blocksQuery from '../query/blocks.graphql';
import historicalBalancerQuery from '../query/historical.graphql';

type DataExtractorFn = (data: BalancerData) => number;

export const dataExtractors: Record<string, DataExtractorFn> = {
    tvl: data => parseFloat(data?.totalLiquidity),
    tsv: data => parseFloat(data?.totalSwapVolume),
    tsfv: data => parseFloat(data?.totalSwapFee),
    public_pools: data => data?.finalizedPoolCount,
    private_pools: data => data?.poolCount - data?.finalizedPoolCount,
};

export const dataFormats: Record<string, string> = {
    tvl: '($0.00a)',
    tsv: '($0.00a)',
    tsfv: '($0.00a)',
    public_pools: '(0)',
    private_pools: '(0)',
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
    const historicalBalancerPriceChartData = useHistoricalBalancePrice(dataKey?.value === 'balancer_usd', graphTimePeriod);

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
    // return that instead if balancer_usd is requested
    if (dataKey?.value === 'balancer_usd')
        return {
            ...historicalBalancerPriceChartData,
            setGraphTimePeriod,
        };

    const historicalBalancerData = useMemo(
        () =>
            (historicalBalancerDataResponses || []).map(historicalBalancerResponse => {
                const data = (historicalBalancerResponse?.data?.balancer as any) || {};
                if (extractor) return extractor(data);
                return data[dataKey?.value];
            }),
        [dataKey, extractor]
    );

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

export const useDailyBalancerGraphState = (data: number[] = [], timestamps: number[] = []) => {
    if (!data.length || !timestamps.length) return {};

    const dailyData = data.map((value, i) => {
        if (i === data.length - 1) return value;
        const nextValue = data[i + 1];
        return nextValue - value;
    });

    return {
        chartData: {
            values: dropRight(dailyData, 1),
            axis: dropRight(timestamps, 1),
            name: 'Non',
        },
    };
};
