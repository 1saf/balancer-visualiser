import React, { FC, useState } from 'react';
import LineGraph, { getSeries } from '../../components/ui/graph/LineGraph';
import LineGraphHeader from '../../components/ui/graph/LineGraphHeader';

import { DropdownOption } from '../../components/design/dropdown/Dropdown';

import { useHistoricalGraphState, useBalancerMovementData, dataExtractors, dataFormats } from './state/hooks';

type Props = {
    query: string;
    dataKey: string;
};

const HistoricalBalancerGraph: FC<Props> = props => {
    const { dataKey } = props;
    const [currentDataKey, setCurrentDataKey] = useState<DropdownOption>({ value: dataKey, label: 'Total Value Locked' });
    const { values, timestamps, name, isLoading, setGraphTimePeriod } = useHistoricalGraphState(
        currentDataKey,
        currentDataKey?.label,
        dataExtractors[currentDataKey?.value]
    );

    const movementData = useBalancerMovementData(values, timestamps);

    const chartConfig = {
        series: [getSeries('line', name, values), getSeries('bar', `Volume Movement`, movementData?.values, 1)],
        axis: timestamps,
    };

    return (
        <React.Fragment>
            <LineGraph
                headerRenderer={ref => (
                    <LineGraphHeader
                        dataFormat={dataFormats[currentDataKey?.value] || '($0.00a)'}
                        isLoading={isLoading}
                        data={chartConfig}
                        onDataKeyChange={setCurrentDataKey}
                        onPeriodChange={setGraphTimePeriod}
                        ref={ref}
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
