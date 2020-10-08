import React, { FC, Fragment } from 'react';
import Heading from '../../components/design/heading/Heading';
import Skeleton from '../../components/design/skeleton/Skeleton';
import Box from '../../components/layout/box/Box';
import StatisticSkeleton from '../../components/ui/statistic/StatisticSkeleton';

type Props = {};

const Skeleton30DGraphs: FC<Props> = props => {
    return (
        <Fragment>
            <Box spanX={12}>
                <Heading level='4'>Loading 30 day metrics...</Heading>
            </Box>
            <Box spanX={[12, 6, 6, 4]}>
                <Skeleton width={372} height={225} viewBox='0 0 372 225'>
                    <StatisticSkeleton />
                </Skeleton>
            </Box>
            <Box spanX={[12, 6, 6, 4]}>
                <Skeleton width={372} height={225} viewBox='0 0 372 225'>
                    <StatisticSkeleton />
                </Skeleton>
            </Box>
            <Box spanX={[12, 6, 6, 4]}>
                <Skeleton width={372} height={225} viewBox='0 0 372 225'>
                    <StatisticSkeleton />
                </Skeleton>
            </Box>
            <Box spanX={[12, 6, 6, 4]}>
                <Skeleton width={372} height={225} viewBox='0 0 372 225'>
                    <StatisticSkeleton />
                </Skeleton>
            </Box>
            <Box spanX={[12, 6, 6, 4]}>
                <Skeleton width={372} height={225} viewBox='0 0 372 225'>
                    <StatisticSkeleton />
                </Skeleton>
            </Box>
            <Box spanX={[12, 6, 6, 4]}>
                <Skeleton width={372} height={225} viewBox='0 0 372 225'>
                    <StatisticSkeleton />
                </Skeleton>
            </Box>
        </Fragment>
    );
};

export default Skeleton30DGraphs;
