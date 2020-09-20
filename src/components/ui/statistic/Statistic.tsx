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

const NoOverflowCard = styled(Card)`
    overflow: hidden;
    min-height: 225px;
    position: relative;
`;

const GraphContainer = styled(Box)`
    position: absolute;
    top: 75px;
    width: 100%;
    height: 175px;
    z-index: 0;
`;

const IconContainer = styled(Box)`
    border: 1px solid ${props => props.theme.borderColor};
    border-radius: 4px;
    box-shadow: 0px 1px 5px rgba(83, 109, 254, 0.1);
`;

const Change = styled(Heading)<{ type: 'positive' | 'negative' }>`
    color: ${props => (props.type === 'positive' ? '#47E5BC' : '#E96B94')};
`;

const WhatsThis = styled(Box)`
    position: absolute;
    right: 1rem;
    top: 1rem;
`;

const Statistic = (props: Props) => {
    const { heading, data, timestamps, value, icon, colors, description } = props;
    const graphData = {
        values: data,
        axis: timestamps,
        name: heading,
    };
    let percentage;
    if (data) {
        percentage = (last(data) - data[0]) / data[0];
    }

    const formattedPercentage = numeral(percentage).format('+0.00%');
    const changeType = percentage > 0 ? 'positive' : 'negative';

    return (
        <NoOverflowCard spanX={4}>
            {description && (
                <Tooltip tip={description}>
                    <WhatsThis>
                        <QuestionMark width='16' height='16' color={tokens.colors.ultramarine} />
                    </WhatsThis>
                </Tooltip>
            )}
            <Stack>
                <Stack orientation='horizontal' paddingX='large' paddingTop='large' align='center' gap='base'>
                    {icon && <IconContainer padding='small'>{icon}</IconContainer>}
                    <Stack gap='small'>
                        <Subheading>{heading}</Subheading>
                        <Stack orientation='horizontal' align='end' gap='small'>
                            <Heading level='3'>{value}</Heading>
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

export default Statistic;
