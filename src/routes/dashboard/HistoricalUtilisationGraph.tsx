import { subDays } from 'date-fns';
import { chunk } from 'lodash';
import { value } from 'numeral';
import React, { FC, useMemo, useState } from 'react';
import { BalancerData } from '../../api/datatypes';
import { DropdownOption } from '../../components/design/dropdown/Dropdown';
import Heading from '../../components/design/heading/Heading';
import Box from '../../components/layout/box/Box';
import LineGraph, { getSeries } from '../../components/ui/graph/LineGraph';
import LineGraphHeader from '../../components/ui/graph/LineGraphHeader';
import { BALANCER_CONTRACT_START_DATE, calculateLiquidityUtilisation, getDates, TODAY } from '../../utils';

import { useHistoricalBalancerState, DataExtractorFn, useEthTimestampBlocks, dataExtractors } from './state/hooks';

type Props = {};

export const graphOptions = [
    {
        value: 'liquidityUtilisation',
        label: 'Liquidity Utilisation',
    },
    {
        value: 'revenueRatio',
        label: 'Revenue Ratio',
    },
];

export const useHistoricalUtilisationState = (name: string, extractor?: DataExtractorFn) => {
    // default to start at 24 hour
    const [graphTimePeriod, setGraphTimePeriod] = useState({ value: 'hourly', label: 'Hourly' });
    const dates = useMemo(() => getDates(graphTimePeriod, 24, BALANCER_CONTRACT_START_DATE), [graphTimePeriod.value]);

    // retrieve the ethereum blocks to get the timestamps for the data we need
    const { isLoading: isLoadingEthBlocks, blocks } = useEthTimestampBlocks(dates);
    const { data: historicalBalancerData, isLoading: isLoadingHistoricalBalancerData } = useHistoricalBalancerState(blocks);

    const values = useMemo(() => {
        return extractor(historicalBalancerData as BalancerData[], 24);
    }, [extractor, isLoadingHistoricalBalancerData === false]);

    return {
        isLoading: isLoadingEthBlocks || isLoadingHistoricalBalancerData,
        timestamps: chunk(dates, 24).map(timestamps => timestamps[0].first_ten),
        values,
        name,
        setGraphTimePeriod,
    };
};

const HistoricalUtilisationGraph: FC<Props> = props => {
    const [dataKey, setDataKey] = useState(graphOptions[0]);

    const { isLoading, timestamps, values } = useHistoricalUtilisationState('Liquidity Utilisation', dataExtractors[dataKey?.value]);

    const movementData = (values?.changes || []).map((change, i) => {
        return [i, Math.abs(change), change > 0 ? 1 : -1];
    });

    const chartConfig = {
        series: [getSeries('line', 'Liquidity Utilisation', values.data), getSeries('bar', 'Movement', movementData, 1)],
        axis: timestamps,
    };

    return (
        <React.Fragment>
            <Box spanX={12}>
                <Heading level='4'>Utilisation</Heading>
            </Box>
            <LineGraph
                headerRenderer={ref => (
                    <LineGraphHeader
                        dataFormat='0.00%'
                        isLoading={isLoading}
                        data={chartConfig}
                        onDataKeyChange={setDataKey}
                        dataOptions={graphOptions}
                        // onPeriodChange={setGraphTimePeriod}
                        ref={ref}
                    />
                )}
                isLoading={isLoading}
                data={chartConfig}
                title={'Liquidity Utilisation'}
                dataFormat='0.00%'
            />
        </React.Fragment>
    );
};

export default HistoricalUtilisationGraph;
