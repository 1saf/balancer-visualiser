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
import Skeleton, { SkeletonText } from '../../design/skeleton/Skeleton';
import StatisticSkeleton from './StatisticSkeleton';
import { getThemeValue } from '../../theme_utils';

type Props = {
    heading: string;
    subtext?: string;
    icon?: React.ReactNode;
    data: number[];
    timestamps: number[];
    value: number | string;
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

const changeBackground = {
    positive: tokens.colors.green100,
    negative: tokens.colors.red100,
    neutral: tokens.colors.red100,
};


const StyledChange = styled(Box)<{ type: 'positive' | 'negative' | 'neutral' }>`
    font-size: 0.75rem;
    font-weight: 600;
    background: ${props => changeBackground[props.type]};
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.25rem 0.5rem;
    border-radius: 40px;
`;

type ChangeProps = {
    change: number;
};

const Change = ({ change }: ChangeProps) => {
    let type = 'neutral';
    let ascii = '';
    if (change > 0) {
        type = 'positive';
        ascii = '↑';
    }
    if (change < 0) {
        type = 'negative';
        ascii = '↓';
    }
    if (change === 0) return null;

    return (
        <StyledChange type={type}>
            {ascii} {numeral(change).format('0.000%')}
        </StyledChange>
    );
};

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
    const { heading, data = [], timestamps, value, icon, description } = props;
    const graphData = {
        values: data,
        axis: timestamps,
        name: heading,
    };

    // Large or small card
    const percentage = data && data?.length ? (last(data) - data[0]) / data[0] : 0;
    const span: ResponsiveProp<number> = data && data?.length ? [12, 6, 6, 4] : [12, 6, 6, 3];

    const formattedPercentage = numeral(percentage).format('+0.00%');

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
                                        <Change change={percentage} />
                                    </Box>
                                </Tooltip>
                            )}
                        </Stack>
                    </Stack>
                </Stack>
                {data && (
                    <GraphContainer>
                        <GlanceLineGraph data={graphData} />
                    </GraphContainer>
                )}
            </Stack>
        </NoOverflowCard>
    );
};

type Statistic = {
    name: string;
    value: string | number;
    previousValue: string | number;
    change: string | number;
};

export type SharedStatisticProps = {
    icon?: React.ReactNode;
    description?: string;
    statistics: Statistic[];
    isLoading: boolean;
};

const StyledSharedStatistic = styled(Grid)`
    background: ${getThemeValue('card.background')};
    box-shadow: ${getThemeValue('shadow')};
    border-radius: 10px;
    border: 1px solid ${getThemeValue('card.borderColor')};
    grid-column-gap: 0;
    grid-row-gap: 0;
    grid-template-columns: repeat(12, 1fr);
`;

const DividedBox = styled(Box)`
    @media (max-width: 640px) {
        &:not(:last-child) {
            border-bottom: 1.5px solid ${props => props.theme.borderColor};
        }
    }

    @media (min-width: 640px) and (max-width: 768px) {
        &:not(:last-child) {
            border-bottom: 1.5px solid ${props => props.theme.borderColor};
        }
        &:nth-last-child(2) {
            border-bottom: none;
        }
        &:not(:nth-child(2n)) {
            border-right: 1.5px solid ${props => props.theme.borderColor};
        }
    }

    @media (min-width: 768px) and (max-width: 1024px) {
        &:nth-child(4n) {
            border-right: none;
        }
        &:not(:last-child) {
            border-bottom: 1.5px solid ${props => props.theme.borderColor};
        }
        &:nth-last-child(2) {
            border-bottom: none;
        }
        &:not(:nth-child(3n)) {
            border-right: 1.5px solid ${props => props.theme.borderColor};
        }
    }

    @media (min-width: 1024px) {
        border-right: 1.5px solid ${props => props.theme.borderColor};
        &:nth-child(4n) {
            border-right: none;
        }
        &:nth-child(n + 5) {
            border-top: 1.5px solid ${props => props.theme.borderColor};
        }
        &:nth-child(4) {
            border-bottom: 1.5px solid ${props => props.theme.borderColor};
            margin-bottom: -1px;
        }
    }
`;

export const SharedStatistic = (props: SharedStatisticProps) => {
    const { icon, description, statistics = [], isLoading } = props;

    return (
        <StyledSharedStatistic>
            {statistics.map(statistic => {
                if (isLoading) {
                    return (
                        <DividedBox key={statistic?.name} spanX={[12, 6, 4, 4, 3]} padding='large'>
                            <Stack gap='small'>
                                <SkeletonText width='120px' height='1.1rem' />
                                <SkeletonText width='100px' height='1.6rem' />
                                <SkeletonText width='85px' height='1.1rem' />
                            </Stack>
                        </DividedBox>
                    );
                }
                return (
                    <DividedBox key={statistic?.name} spanX={[12, 6, 4, 4, 3]} padding='large'>
                        {description && (
                            <Tooltip tip={description}>
                                <WhatsThis>
                                    <QuestionMark width='16' height='16' color={tokens.colors.ultramarine} />
                                </WhatsThis>
                            </Tooltip>
                        )}
                        <Stack>
                            <Stack orientation='horizontal' width='100%' align='center' gap='base'>
                                {icon && <IconContainer padding='small'>{icon}</IconContainer>}
                                <Stack gap='small' width='100%'>
                                    <Subheading>{statistic?.name}</Subheading>
                                    <Stack orientation='horizontal' align='end' gap='small'>
                                        <Heading level='4'>{statistic?.value}</Heading>
                                    </Stack>
                                    <Stack orientation='horizontal' width='100%' justify='between'>
                                        <Subheading>From {statistic?.previousValue}</Subheading>
                                        <Change change={statistic?.change} />
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
