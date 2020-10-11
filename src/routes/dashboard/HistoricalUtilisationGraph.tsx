import { subDays } from 'date-fns';
import { chunk } from 'lodash';
import React, { FC, useMemo, useState } from 'react';
import { BalancerData } from '../../api/datatypes';
import { DropdownOption } from '../../components/design/dropdown/Dropdown';
import Heading from '../../components/design/heading/Heading';
import Box from '../../components/layout/box/Box';
import LineGraph, { getSeries } from '../../components/ui/graph/LineGraph';
import { BALANCER_CONTRACT_START_DATE, calculateLiquidityUtilisation, getDates, TODAY } from '../../utils';

import { useHistoricalBalancerState, DataExtractorFn, useEthTimestampBlocks } from './state/hooks';

type Props = {};

export const useHistoricalUtilisationState = (name: string, extractor?: DataExtractorFn) => {
    // default to start at 24 hour
    const [graphTimePeriod, setGraphTimePeriod] = useState({ value: 'hourly', label: 'Hourly' });
    const dates = useMemo(() => getDates(graphTimePeriod, 24, BALANCER_CONTRACT_START_DATE), [graphTimePeriod.value]);

    // retrieve the ethereum blocks to get the timestamps for the data we need
    const { isLoading: isLoadingEthBlocks, blocks } = useEthTimestampBlocks(dates);
    const { data: historicalBalancerData, isLoading: isLoadingHistoricalBalancerData } = useHistoricalBalancerState(blocks, extractor);

    const values = calculateLiquidityUtilisation(historicalBalancerData as BalancerData[], 24);
    console.log('d', chunk(dates, 24));

    return {
        isLoading: isLoadingEthBlocks || isLoadingHistoricalBalancerData,
        timestamps: chunk(dates, 24).map(timestamps => timestamps[0].first_ten),
        values,
        name,
        setGraphTimePeriod,
    };
};

const HistoricalUtilisationGraph: FC<Props> = props => {
    const {} = props;
    const {
        isLoading,
        timestamps,
        values,
    } = useHistoricalUtilisationState('Liquidity Utilisation');

    const chartConfig = {
        series: [getSeries('line', name, values.data)],
        axis: timestamps,
    };

    console.log('lmao', chartConfig)
    return (
        <React.Fragment>
            <Box spanX={12}>
                <Heading level='4'>In Depth</Heading>
            </Box>
            <LineGraph
                // headerRenderer={ref => (
                //     <LineGraphHeader
                //         dataFormat={dataFormats[currentDataKey?.value] || '($0.00a)'}
                //         isLoading={isLoading}
                //         data={chartConfig}
                //         onDataKeyChange={setCurrentDataKey}
                //         onPeriodChange={setGraphTimePeriod}
                //         ref={ref}
                //     />
                // )}
                isLoading={isLoading}
                data={chartConfig}
                title={'Liquidity Utilisation'}
                dataFormat='0.00%'
            />
        </React.Fragment>
    );
};

export default HistoricalUtilisationGraph;
