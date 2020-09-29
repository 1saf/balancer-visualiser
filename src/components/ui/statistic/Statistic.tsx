import React, { FC } from 'react';
import Card from '../../layout/card/Card';
import Stack from '../../layout/stack/Stack';
import Subheading from '../../design/subheading/Subheading';
import Heading from '../../design/heading/Heading';

import GlanceLineGraph from '../graph/GlanceLineGraph';
import styled from 'styled-components';
import Box from '../../layout/box/Box';
import { last } from 'lodash';
import numeral from 'numeral';
import Tooltip from '../../design/tooltip/Tooltip';

import QuestionMark from '../../../assets/question-circle-solid.svg';
import { tokens } from '../../../style/Theme';
import { ResponsiveProp } from '../../layout/layout.t';
import Grid from '../../layout/grid/Grid';

type Props = {
    heading: string;
    subtext?: string;
    icon?: React.ReactNode;
    data: number[];
    timestamps: number[];
    value: number | string;
    colors: [string, string];
    description?: string;
};

const GraphContainer = styled(Box)`
    position: absolute;
    top: 75px;
    width: 100%;
    height: 175px;
    z-index: 0;
`;

const IconContainer = styled(Box)`
    border-radius: 4px;
`;

const Change = styled(Heading)<{ type: 'positive' | 'negative' }>`
    color: ${props => (props.type === 'positive' ? '#47E5BC' : '#E96B94')};
`;

const WhatsThis = styled(Box)`
    position: absolute;
    right: 1rem;
    top: 1rem;
`;

const NoOverflowCard = styled(Card)<{ withGraph?: boolean }>`
    overflow: hidden;
    min-height: ${props => (props.withGraph ? '225px' : '100px')};
    position: relative;
`;

const Statistic = (props: Props) => {
    const { heading, data = [], timestamps, value, icon, colors, description } = props;
    const graphData = {
        values: data,
        axis: timestamps,
        name: heading,
    };

    // Large or small card
    const percentage = data && data?.length ? (last(data) - data[0]) / data[0] : 0;
    const span: ResponsiveProp<number> = data && data?.length ? [12, 6, 6, 4] : [12, 6, 6, 3];

    const formattedPercentage = numeral(percentage).format('+0.00%');
    const changeType = percentage > 0 ? 'positive' : 'negative';

    return (
        <NoOverflowCard withGraph={!!(data && data?.length)} spanX={span}>
            {description && (
                <Tooltip tip={description}>
                    <WhatsThis>
                        <QuestionMark width='16' height='16' color={tokens.colors.ultramarine} />
                    </WhatsThis>
                </Tooltip>
            )}
            <Stack>
                <Stack orientation='horizontal' paddingX='large' paddingTop='large' align='center' gap='base'>
                    {/* {icon && <IconContainer padding='small'>{icon}</IconContainer>} */}
                    <Stack gap='small'>
                        <Subheading>{heading}</Subheading>
                        <Stack orientation='horizontal' align='end' gap='small'>
                            <Heading level='4'>{value}</Heading>
                            {data && (
                                <Tooltip tip={`${formattedPercentage} over the past 30 days.`}>
                                    <Box>
                                        <Change type={changeType} level='6'>
                                            {formattedPercentage}
                                        </Change>
                                    </Box>
                                </Tooltip>
                            )}
                        </Stack>
                    </Stack>
                </Stack>
                {data && (
                    <GraphContainer>
                        <GlanceLineGraph colors={colors} data={graphData} />
                    </GraphContainer>
                )}
            </Stack>
        </NoOverflowCard>
    );
};

type Statistic = {
    name: string;
    value: number;
};

export type SharedStatisticProps = {
    icon?: React.ReactNode;
    description?: string;
    statistics: Statistic[];
};

const StyledSharedStatistic = styled(Grid)`
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 0 0 1px ${props => props.theme.borderColor};
`;

const DividedBox = styled(Box)`
    &:not(:last-child) {
        border-right: 1.5px solid ${props => props.theme.borderColor};

    }
    &:not(:first-child) {
        padding-left: 0 !important;
    }
`;

export const SharedStatistic = (props: SharedStatisticProps) => {
    const { icon, description, statistics = [] } = props;

    const spanX = 12 / statistics.length;
    return (
        <StyledSharedStatistic>
            {statistics.map(statistic => {
                return (
                    <DividedBox spanX={spanX} padding='large'>
                        {description && (
                            <Tooltip tip={description}>
                                <WhatsThis>
                                    <QuestionMark width='16' height='16' color={tokens.colors.ultramarine} />
                                </WhatsThis>
                            </Tooltip>
                        )}
                        <Stack>
                            <Stack orientation='horizontal' align='center' gap='base'>
                                {icon && <IconContainer padding='small'>{icon}</IconContainer>}
                                <Stack gap='small'>
                                    <Subheading>{statistic?.name}</Subheading>
                                    <Stack orientation='horizontal' align='end' gap='small'>
                                        <Heading level='4'>{statistic?.value}</Heading>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Stack>
                    </DividedBox>
                );
            })}
        </StyledSharedStatistic>
    );
};

export default Statistic;
