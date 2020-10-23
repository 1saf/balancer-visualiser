import React, { FC } from 'react';
import historicalPoolsQuery from './query/historical.graphql';

import HistoricalBalancerGraph from './HistoricalBalancerGraph';

import Theme from '../../style/Theme';
import Grid from '../../components/layout/grid/Grid';

import { useCurrentBalancerStatistics } from './state/hooks';
import Dashboard24HMetrics from './Dashboard24HMetrics';
import HistoricalUtilisationGraph from './HistoricalUtilisationGraph';

const Dashboard: FC<any> = ({ children }) => {
    const currentBalancerState = useCurrentBalancerStatistics();

    return (
        <Grid background={Theme.background} width='100%' paddingY='large' paddingX={['base', 'base', 'base', 'none']}>
            <Dashboard24HMetrics balancerState={currentBalancerState} />
            <HistoricalBalancerGraph dataKey='totalLiquidity' query={historicalPoolsQuery} />
            <HistoricalUtilisationGraph />
        </Grid>
    );
};

export default Dashboard;
