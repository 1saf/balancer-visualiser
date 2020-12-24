import React, { FC, Fragment, useCallback, useState } from 'react';
import { BalancerData, BalancerState, Change24H, Option } from '../../api/datatypes';
import Box from '../../components/layout/box/Box';
import { SharedStatistic } from '../../components/ui/statistic/Statistic';
import { useOverviewStatistics } from './state/hooks';
import numeral from 'numeral';
import Heading from '../../components/design/heading/Heading';
import ButtonGroup from '../../components/design/button_group/ButtonGroup';
import Stack from '../../components/layout/stack/Stack';
import { last, over } from 'lodash';

type Props = {
    balancerState: BalancerState;
};

const OverviewOptions = [
    { value: 'hour', label: '24H', periodLength: 48 },
    { value: 'hour', label: '7 Days', periodLength: 336 },
    { value: 'hour', label: '30 Days', periodLength: 1440 },
];

const Dashboard24HMetrics: FC<Props> = props => {
    const [overviewPeriod, _setOverviewPeriod] = useState(OverviewOptions[0]);
    const {
        feeVolume,
        swapVolume,
        utilisation,
        revenueRatio,
        totalLiquidity,
        privatePools,
        finalizedPoolCount,
        balancerPrice,
        isLoading,
    } = useOverviewStatistics(overviewPeriod);

    const setOverviewPeriod = useCallback((option: Option) => {
        _setOverviewPeriod(option);
    }, []);

    return (
        <Fragment>
            <Box spanX={12}>
                <Stack align='start' gap='base'>
                    <Heading level='5'>Overview</Heading>
                    <ButtonGroup options={OverviewOptions} value={`${overviewPeriod?.value}-${overviewPeriod.label}`} setValue={setOverviewPeriod} />
                </Stack>
            </Box>
            <Box spanX={12} style={{ marginTop: '-0.5rem' }}>
                <SharedStatistic
                    isLoading={isLoading}
                    statistics={[
                        {
                            name: 'Total Value Locked',
                            value: numeral(totalLiquidity?.today).format('$0.00a'),
                            previousValue: numeral(totalLiquidity?.yesterday).format('$0.00a'),
                            change: totalLiquidity?.change,
                        },
                        {
                            name: 'Total Fees',
                            value: numeral(feeVolume?.today).format('$0.00a'),
                            previousValue: numeral(feeVolume?.yesterday).format('$0.00a'),
                            change: feeVolume?.change,
                        },
                        {
                            name: 'Total Swap Volume',
                            value: numeral(swapVolume?.today).format('$0.00a'),
                            previousValue: numeral(swapVolume?.yesterday).format('$0.00a'),
                            change: swapVolume?.change,
                        },
                        {
                            name: 'Public Pools',
                            value: numeral(finalizedPoolCount?.today).format('0'),
                            previousValue: numeral(finalizedPoolCount?.yesterday).format('0'),
                            change: finalizedPoolCount?.change,
                        },
                        {
                            name: 'Private Pools',
                            value: numeral(privatePools?.today).format('0'),
                            previousValue: numeral(privatePools?.yesterday).format('0'),
                            change: privatePools?.change,
                        },
                        {
                            name: 'Liquidity Utilisation',
                            value: numeral(utilisation?.data[utilisation?.data.length - 2]).format('0.000%'),
                            previousValue: numeral(utilisation?.data[0]).format('0.000%'),
                            change: utilisation?.changes[0],
                        },
                        {
                            name: 'Revenue Ratio',
                            value: numeral(revenueRatio?.data[revenueRatio?.data.length - 2]).format('0.000%'),
                            previousValue: numeral(revenueRatio?.data[0]).format('0.000%'),
                            change: revenueRatio?.changes[0],
                        },
                        {
                            name: 'Balancer Price',
                            value: numeral(balancerPrice?.today).format('$0.00a'),
                            previousValue: numeral(balancerPrice?.yesterday).format('$0.00a'),
                            change: balancerPrice?.change,
                        },
                    ]}
                />
            </Box>
        </Fragment>
    );
};

export default Dashboard24HMetrics;
