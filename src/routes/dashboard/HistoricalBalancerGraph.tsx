import React, { FC, useMemo, useState } from 'react';
import { subDays, subMonths, subYears, subHours, eachDayOfInterval, getUnixTime, addMinutes, format as formatDate, startOfDay } from 'date-fns';
import { GraphQLResponse, useGraphQuery, ETH_BLOCKS_SUBGRAPH_URL } from '../../api/graphql';
import blocksQuery from './query/blocks.graphql';
import { sortBy } from 'lodash';
import LineGraph from '../../components/ui/graph/LineGraph';

type Props = {
    query: string;
    dataKey: string;
    name: string;
};

export type TimeType = 'hour' | 'days' | 'months' | 'years';
export type TimePeriod = {
    value: 'hourly' | 'daily' | string,
    label: string,
};

type EthBlocksResponse = GraphQLResponse<{ blocks: { id: string; number: string; timestamp: string }[] }>[];

const getDates = (timePeriod: TimePeriod) => {
    let dates: any[] = [];
    const today = new Date();
    if (timePeriod.value === 'hourly') {
        for (let i = 1; i <= 24; i++) {
            const date = subHours(today, i);
            // subgraph queries are faster when requested as the first block between 2 timestamps
            dates.push({
                first_ten: getUnixTime(date),
                last_ten: getUnixTime(addMinutes(date, 10)),
                date: formatDate(date, 'yyyy-MM-dd'),
            });
        }
    } else if (timePeriod?.value === 'daily') {
        dates = eachDayOfInterval({
            start: new Date(2020, 2, 29),
            end: today,
        }).map(date => ({
            first_ten: getUnixTime(date),
            last_ten: getUnixTime(addMinutes(date, 10)),
            date: formatDate(date, 'yyyy-MM-dd'),
        }));
    }

    return dates.reverse();
};

type BalancerResponse = GraphQLResponse<{
    balancer: {
        finalizedPoolCount: number;
        poolCount: number;
        totalLiquidity: string;
        totalSwapFee: string;
        totalSwapVolume: string;
    };
}>;

const useHistoricalGraphState = (historicalDataQuery: string, historicalDataKey: string, name: string) => {
    // default to start at 24 hour
    const [graphTimePeriod, setGraphTimePeriod] = useState({ value: 'daily', label: 'Daily' });
    const requests = useMemo(() => getDates(graphTimePeriod), [graphTimePeriod.value]);

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

    const historicalBalancerData = (historicalBalancerResponses || []).map(historicalBalancerResponse => {
        return ((historicalBalancerResponse?.data?.balancer as any) || {})[historicalDataKey];
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

const HistoricalBalancerGraph: FC<Props> = props => {
    const { query, dataKey, name } = props;
    const { chartData, isLoading, setGraphTimePeriod } = useHistoricalGraphState(query, dataKey, name);
    return <LineGraph isLoading={isLoading} data={chartData} title={name} onPeriodChange={setGraphTimePeriod} />;
};

export default HistoricalBalancerGraph;
