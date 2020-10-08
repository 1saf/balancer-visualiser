import React, { FC, Fragment } from 'react';
import { BalancerData, BalancerState, Change24H } from '../../api/datatypes';
import Box from '../../components/layout/box/Box';
import { SharedStatistic } from '../../components/ui/statistic/Statistic';
import { use24HourStatistics } from './state/hooks';
import numeral from 'numeral';
import Heading from '../../components/design/heading/Heading';

type Props = {
    balancerState: BalancerState;
};

const Dashboard24HMetrics: FC<Props> = props => {
    const { balancerState } = props;
    const { feeVolume, swapVolume, utilisation, revenueRatio } = use24HourStatistics(balancerState);

    return (
        <Fragment>
            <Box spanX={12}>
                <Heading level='4'>Overview - 24H</Heading>
            </Box>
            <Box spanX={12}>
                <SharedStatistic
                    statistics={[
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
                            name: 'Liquidity Utilisation',
                            value: numeral(utilisation?.data[1]).format('0.000%'),
                            previousValue: numeral(utilisation?.data[0]).format('0.000%'),
                            change: utilisation?.changes[1],
                        },
                        {
                            name: 'Revenue Ratio',
                            value: numeral(revenueRatio?.data[1]).format('0.000%'),
                            previousValue: numeral(revenueRatio?.data[0]).format('0.000%'),
                            change: revenueRatio?.changes[1],
                        },
                    ]}
                />
            </Box>
        </Fragment>
    );
};

export default Dashboard24HMetrics;
