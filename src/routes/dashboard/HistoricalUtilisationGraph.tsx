import { subDays } from 'date-fns';
import React, { FC, useMemo, useState } from 'react';
import { DropdownOption } from '../../components/design/dropdown/Dropdown';
import { BALANCER_CONTRACT_START_DATE, calculateLiquidityUtilisation, getDates, TODAY } from '../../utils';

import { useHistoricalBalancerState, DataExtractorFn, useEthTimestampBlocks } from './state/hooks';

type Props = {};


export const useHistoricalUtilisationState = (name: string, extractor?: DataExtractorFn) => {
    // default to start at 24 hour
    const [graphTimePeriod, setGraphTimePeriod] = useState({ value: 'hourly', label: 'Hourly' });
    const dates = useMemo(() => getDates(graphTimePeriod, 24, subDays(TODAY, 90)), [graphTimePeriod.value]);

    // retrieve the ethereum blocks to get the timestamps for the data we need
    const { isLoading: isLoadingEthBlocks, blocks } = useEthTimestampBlocks(dates);
    const x = useHistoricalBalancerState(
        blocks,
        extractor
    );

    // console.log('d', dates);
    // const esk = calculateLiquidityUtilisation(historicalBalancerData, 24);
    // console.log('esk', esk);

    // const isLoading = isLoadingEthBlocks || isLoadingHistoricalBalancerData;
    return {
        // isLoading,
        // values: (historicalBalancerData || []).map(parseFloat),
        // timestamps: dates.map(r => r.first_ten),
        name,
        setGraphTimePeriod,
    };
};


const HistoricalUtilisationGraph: FC<Props> = props => {
    const l = useHistoricalUtilisationState('bingo');
    const {} = props;
    return <div></div>;
};

export default HistoricalUtilisationGraph;
