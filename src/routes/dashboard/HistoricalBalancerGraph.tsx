import React, { FC, useMemo, useState } from 'react';
import { subDays, subMonths, subYears, subHours, eachDayOfInterval, getUnixTime, addMinutes, format as formatDate, startOfDay } from 'date-fns';
import { GraphQLResponse, useGraphQuery, ETH_BLOCKS_SUBGRAPH_URL, EthBlocksResponse } from '../../api/graphql';
import blocksQuery from './query/blocks.graphql';
import { sortBy } from 'lodash';
import LineGraph from '../../components/ui/graph/LineGraph';
import { getDates } from '../../utils';
import { BalancerResponse } from '../../api/datatypes';

type Props = {
    queryLiteral: string;
    dataKey: string;
    name: string;
};

const useHistoricalGraphState = (queryLiteral: any, historicalDataKey: string, name: string) => {
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
    } = useGraphQuery<BalancerResponse[]>(['historicalBlocks', { requests: sortedBlockNumbers }], queryLiteral, {
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
    const { queryLiteral, dataKey, name } = props;
    const { chartData, isLoading, setGraphTimePeriod } = useHistoricalGraphState(queryLiteral, dataKey, name);
    return <LineGraph isLoading={isLoading} data={chartData} title='Total Value Locked' onPeriodChange={setGraphTimePeriod} />;
};

export default HistoricalBalancerGraph;
