import React, { FC } from 'react';
import Box from '../../components/layout/box/Box';
import historicalPoolsQuery from './query/historical.graphql';

import HistoricalBalancerGraph from './HistoricalBalancerGraph';

import Theme from '../../style/Theme';
import Heading from '../../components/design/heading/Heading';
import Skeleton from '../../components/design/skeleton/Skeleton';
import StatisticSkeleton from '../../components/ui/statistic/StatisticSkeleton';
import Grid from '../../components/layout/grid/Grid';

import { useCurrentBalancerStatistics } from './state/hooks';
import Dashboard24HMetrics from './Dashboard24HMetrics';
import Dashboard30DGraphs from './Dashboard30DGraphs';

const Dashboard: FC<any> = ({ children }) => {
    const currentBalancerState = useCurrentBalancerStatistics();

    return (
        <Grid background={Theme.background} width='100%' paddingY='large' paddingX={['base', 'base', 'base', 'none']}>
            <Dashboard24HMetrics balancerState={currentBalancerState} />
            <Dashboard30DGraphs balancerState={currentBalancerState}/>
            <HistoricalBalancerGraph dataKey='totalLiquidity' query={historicalPoolsQuery} />
        </Grid>
    );
};

export default Dashboard;
