import React, { FC, useMemo, useState } from 'react';
import { subDays, subMonths, subYears, subHours, endOfDay, getUnixTime, addMinutes, format as formatDate } from 'date-fns';
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
    type: TimeType;
    value: number;
};

const dateFuncMap: Record<TimeType, Function> = {
    days: subDays,
    months: subMonths,
    years: subYears,
    hour: subHours,
};

type EthBlocksResponse = GraphQLResponse<{ blocks: { id: string; number: string; timestamp: string }[] }>[];

const getDates = (timePeriod: TimePeriod) => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= timePeriod.value; i++) {
        let date = dateFuncMap[timePeriod.type](today, i);
        if (timePeriod.type !== 'hour') date = endOfDay(date);

        // subgraph queries are faster when requested as the first block between 2 timestamps
        dates.push({
            first_ten: getUnixTime(date),
            last_ten: getUnixTime(addMinutes(date, 10)),
            date: formatDate(date, 'yyyy-MM-dd'),
        });
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
    const [graphTimePeriod, setGraphTimePeriod] = useState<TimePeriod>({ type: 'hour', value: 24 });
    const requests = useMemo(() => getDates(graphTimePeriod), [graphTimePeriod.value, graphTimePeriod.type]);

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
    return <LineGraph isLoading={isLoading} data={chartData} title='Total Value Locked' onPeriodChange={setGraphTimePeriod} />;
};

export default HistoricalBalancerGraph;
