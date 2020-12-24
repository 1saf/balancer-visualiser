import React, { FC, useEffect } from 'react';
import historicalPoolsQuery from './query/historical.graphql';

import HistoricalBalancerGraph from './HistoricalBalancerGraph';

import Grid from '../../components/layout/grid/Grid';
import { useAppContext } from '../../layouts/AppLayout';

import { useCurrentBalancerStatistics } from './state/hooks';
import Dashboard24HMetrics from './Dashboard24HMetrics';
import HistoricalUtilisationGraph from './HistoricalUtilisationGraph';

const Dashboard: FC<any> = ({ children }) => {
    const currentBalancerState = useCurrentBalancerStatistics();
    const { setHeading } = useAppContext();

    useEffect(() => {
        setHeading('Analytics');
    }, []);

    return (
        <Grid width='100%' paddingY='large' paddingX={['base', 'base', 'base', 'none']}>
            <Dashboard24HMetrics balancerState={currentBalancerState} />
            <HistoricalBalancerGraph dataKey='totalLiquidity' query={historicalPoolsQuery} />
            <HistoricalUtilisationGraph />
        </Grid>
    );
};

export default Dashboard;
