import React, { FC, useState } from 'react';
import LineGraph, { getSeries } from '../../components/ui/graph/LineGraph';
import LineGraphHeader from '../../components/ui/graph/LineGraphHeader';

import { DropdownOption } from '../../components/design/dropdown/Dropdown';

import { useHistoricalGraphState, useBalancerMovementData, dataExtractors, dataFormats } from './state/hooks';
import Box from '../../components/layout/box/Box';
import Heading from '../../components/design/heading/Heading';

type Props = {
    query: string;
    dataKey: string;
};

export const graphOptions = [
    {
        value: 'totalLiquidity',
        label: 'Total Value Locked',
    },
    {
        value: 'totalSwapVolume',
        label: 'Total Swap Volume',
    },
    {
        value: 'totalSwapFeeVolume',
        label: 'Total Swap Fee Volume',
    },
    {
        value: 'balancerPrice',
        label: 'BAL Price (USD)',
    },
    {
        value: 'finalizedPoolCount',
        label: 'Public Pools',
    },
    {
        value: 'privatePools',
        label: 'Private Pools',
    },
];

const PeriodOptions = [
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' },
    { value: 'max', label: 'Max' },
];

const HistoricalBalancerGraph: FC<Props> = props => {
    const { dataKey } = props;
    const [currentDataKey, setCurrentDataKey] = useState<DropdownOption>({ value: dataKey, label: 'Total Value Locked' });
    const { values, timestamps, name, isLoading, setGraphTimePeriod } = useHistoricalGraphState(
        currentDataKey,
        currentDataKey?.label,
        dataExtractors[currentDataKey?.value]
    );

    const movementData = useBalancerMovementData(currentDataKey?.value, values, timestamps);
    console.log('mvmt', movementData);
    const chartConfig = {
        series: [getSeries('line', name, values), getSeries("bar", "Movement", movementData.values, 1)],
        axis: timestamps,
    };

    return (
        <React.Fragment>
            <Box spanX={12}>
                <Heading level='5'>Balancer Statistics</Heading>
            </Box>
            <LineGraph
                headerRenderer={ref => (
                    <LineGraphHeader
                        dataFormat={dataFormats[currentDataKey?.value] || '($0.00a)'}
                        isLoading={isLoading}
                        data={chartConfig}
                        onDataKeyChange={setCurrentDataKey}
                        onPeriodChange={setGraphTimePeriod}
                        ref={ref}
                        dataOptions={graphOptions}
                        periodOptions={PeriodOptions}
                    />
                )}
                isLoading={isLoading}
                data={chartConfig}
                title={currentDataKey?.label}
                dataFormat={dataFormats[currentDataKey?.value] || '($0.00a)'}
            />
        </React.Fragment>
    );
};

export default HistoricalBalancerGraph;
