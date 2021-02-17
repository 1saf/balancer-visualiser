import React, { FC, Fragment, useCallback, useState } from 'react';
import { BalancerData, BalancerState, Change24H, Option, Period } from '../../api/datatypes';
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

const PeriodOptions = [
    { value: '2d', label: '24H' },
    { value: '14d', label: '7D' },
    { value: '60d', label: '30D' },
];

const Dashboard24HMetrics: FC<Props> = props => {
    const [overviewPeriod, _setOverviewPeriod] = useState(PeriodOptions[0]);

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
    } = useOverviewStatistics(overviewPeriod.value as Period);

    const setOverviewPeriod = useCallback((option: Option) => {
        _setOverviewPeriod(option);
    }, []);

    return (
        <Fragment>
            <Box spanX={12}>
                <Stack align='start' gap='base'>
                    <Heading level='5'>Overview</Heading>
                    <ButtonGroup options={PeriodOptions} value={`${overviewPeriod?.value}-${overviewPeriod.label}`} setValue={setOverviewPeriod} />
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
                            volume: totalLiquidity?.volume,
                        },
                        {
                            name: 'Total Fees',
                            value: numeral(feeVolume?.today).format('$0.00a'),
                            previousValue: numeral(feeVolume?.yesterday).format('$0.00a'),
                            change: feeVolume?.change,
                            volume: feeVolume?.volume,
                        },
                        {
                            name: 'Total Swap Volume',
                            value: numeral(swapVolume?.today).format('$0.00a'),
                            previousValue: numeral(swapVolume?.yesterday).format('$0.00a'),
                            change: swapVolume?.change,
                            volume: swapVolume?.volume,
                        },
                        {
                            name: 'Public Pools',
                            value: numeral(finalizedPoolCount?.today).format('0'),
                            previousValue: numeral(finalizedPoolCount?.yesterday).format('0'),
                            change: finalizedPoolCount?.change,
                            volume: finalizedPoolCount?.volume,
                        },
                        {
                            name: 'Private Pools',
                            value: numeral(privatePools?.today).format('0'),
                            previousValue: numeral(privatePools?.yesterday).format('0'),
                            change: privatePools?.change,
                            volume: privatePools?.volume,
                        },
                        {
                            name: 'Liquidity Utilisation',
                            value: numeral(utilisation?.data[utilisation?.data.length - 1]).format('0.000%'),
                            previousValue: numeral(utilisation?.data[0]).format('0.000%'),
                            change: utilisation?.changes[0],
                            volume: (last(utilisation?.data) - utilisation.data[0]) * 100,
                        },
                        {
                            name: 'Revenue Ratio',
                            value: numeral(revenueRatio?.data[revenueRatio?.data.length - 1]).format('0.000%'),
                            previousValue: numeral(revenueRatio?.data[0]).format('0.000%'),
                            change: revenueRatio?.changes[0],
                            volume: (last(revenueRatio?.data) - revenueRatio.data[0]) * 100,
                        },
                        {
                            name: 'Balancer Price',
                            value: numeral(balancerPrice?.today).format('$0.00a'),
                            previousValue: numeral(balancerPrice?.yesterday).format('$0.00a'),
                            change: balancerPrice?.change,
                            volume: balancerPrice?.volume,
                        },
                    ]}
                />
            </Box>
        </Fragment>
    );
};

export default Dashboard24HMetrics;
