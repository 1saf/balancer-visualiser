import React, { FC, useMemo, useState } from 'react';
import {
    subDays,
    subMonths,
    subYears,
    subHours,
    eachDayOfInterval,
    getUnixTime,
    addMinutes,
    format as formatDate,
    startOfDay,
} from 'date-fns';
import { GraphQLResponse, useGraphQuery, ETH_BLOCKS_SUBGRAPH_URL, EthBlocksResponse } from '../../api/graphql';
import blocksQuery from './query/blocks.graphql';
import { sortBy } from 'lodash';
import LineGraph from '../../components/ui/graph/LineGraph';
import { BALANCER_CONTRACT_START_DATE, getDates, TODAY } from '../../utils';
import { BalancerData, BalancerResponse, HistoricalCGMarketChart } from '../../api/datatypes';
import LineGraphHeader from '../../components/ui/graph/LineGraphHeader';
import { useQuery } from 'react-query';
import { getHistoricalBalancerPrice } from './query/rest';

import historicalBalancerQuery from './query/historical.graphql';

type Props = {
    query: string;
    dataKey: string;
    name: string;
    dataFetchHook: any;
};

type DataExtractorFn = (data: BalancerData) => number;

const useHistoricalBalancePrice = (enabled: boolean) => {
    const { data: historicalBalPriceResponse, isLoading } = useQuery<HistoricalCGMarketChart>(
        [
            'historicalBalPrice',
            {
                from: getUnixTime(BALANCER_CONTRACT_START_DATE),
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
        chartData: { values: historicalBalPrices, axis: historicalBalTimestamps, name: 'Balancer Price (USD)' },
        isLoading,
    };
};

const useHistoricalGraphState = (dataKey: string, name: string, extractor?: DataExtractorFn) => {
    // default to start at 24 hour
    const [graphTimePeriod, setGraphTimePeriod] = useState({ value: 'daily', label: 'Daily' });
    const requests = useMemo(() => getDates(graphTimePeriod), [graphTimePeriod.value]);

    // get balancer usd prices, query disabled until till the datakey is correct
    const historicalBalancerPriceChartData = useHistoricalBalancePrice(dataKey === 'balancer_usd');

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
    } = useGraphQuery<BalancerResponse[]>(['historicalBlocks', { requests: sortedBlockNumbers }], historicalBalancerQuery, {
        loop: true,
        enabled: sortedBlockNumbers.length,
    });

    if (dataKey === 'balancer_usd')
        return {
            ...historicalBalancerPriceChartData,
            setGraphTimePeriod,
        };

    const historicalBalancerData = (historicalBalancerResponses || []).map(historicalBalancerResponse => {
        const data = (historicalBalancerResponse?.data?.balancer as any) || {};
        if (extractor) return extractor(data);
        return data[dataKey];
    });

    const chartData = {
        values: (historicalBalancerData || []).map(parseFloat),
        axis: requests.map(r => r.first_ten),
        name,
    };

    const isLoading = isEthTimestampResponseLoading || isHistoricalBalancerResponseLoading;
    const isFetching = isEthTimestampResponseFetching || isHistoricalBalancerResponseFetching;
    return { chartData, isLoading, isFetching, setGraphTimePeriod };
};

const dataExtractors: Record<string, DataExtractorFn> = {
    tvl: data => parseFloat(data?.totalLiquidity),
    tsv: data => parseFloat(data?.totalSwapVolume),
    tsfv: data => parseFloat(data?.totalSwapFee),
    public_pools: data => data?.finalizedPoolCount,
    private_pools: data => data?.poolCount - data?.finalizedPoolCount,
};

const dataFormats: Record<string, string> = {
    tvl: '($0.00a)',
    tsv: '($0.00a)',
    tsfv: '($0.00a)',
    public_pools: '(0)',
    private_pools: '(0)',
};

const HistoricalBalancerGraph: FC<Props> = props => {
    const { dataKey, name } = props;
    const [currentDataKey, setCurrentDataKey] = useState(dataKey);

    const { chartData, isLoading, setGraphTimePeriod } = useHistoricalGraphState(currentDataKey, name, dataExtractors[currentDataKey]);

    return (
        <LineGraph
            headerRenderer={ref => (
                <LineGraphHeader
                    dataFormat={dataFormats[currentDataKey] || '($0.00a)'}
                    isLoading={isLoading}
                    data={chartData}
                    onDataKeyChange={setCurrentDataKey}
                    onPeriodChange={setGraphTimePeriod}
                    ref={ref}
                />
            )}
            isLoading={isLoading}
            data={chartData}
            title={name}
        />
    );
};

export default HistoricalBalancerGraph;
