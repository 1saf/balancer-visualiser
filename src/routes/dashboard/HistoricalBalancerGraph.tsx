import React, { FC, useState } from 'react';
import LineGraph from '../../components/ui/graph/LineGraph';
import LineGraphHeader from '../../components/ui/graph/LineGraphHeader';

import { DropdownOption } from '../../components/design/dropdown/Dropdown';

import { useHistoricalGraphState, useDailyBalancerGraphState, dataExtractors, dataFormats } from './state/hooks';

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

    const chartData = {
        values,
        axis: timestamps,
        name,
    };

    // const { chartData: nonCumData } = useDailyBalancerGraphState(chartData?.values, chartData?.axis);
    return (
        <React.Fragment>
            <LineGraph
                headerRenderer={ref => (
                    <LineGraphHeader
                        dataFormat={dataFormats[currentDataKey?.value] || '($0.00a)'}
                        isLoading={isLoading}
                        data={chartData}
                        onDataKeyChange={setCurrentDataKey}
                        onPeriodChange={setGraphTimePeriod}
                        ref={ref}
                    />
                )}
                isLoading={isLoading}
                data={chartData}
                title={currentDataKey?.label}
                dataFormat={dataFormats[currentDataKey?.value] || '($0.00a)'}
            />
            {/* <BarGraph
                headerRenderer={ref => (
                    <LineGraphHeader
                        dataFormat={dataFormats[currentDataKey?.value] || '($0.00a)'}
                        isLoading={isLoading}
                        data={chartData}
                        onDataKeyChange={setCurrentDataKey}
                        onPeriodChange={setGraphTimePeriod}
                        ref={ref}
                    />
                )}
                isLoading={isLoading}
                data={nonCumData}
                title='oo'
                dataFormat={dataFormats[currentDataKey?.value] || '($0.00a)'}
            /> */}
        </React.Fragment>
    );
};

export default HistoricalBalancerGraph;
