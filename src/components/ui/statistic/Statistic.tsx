import React, { FC } from 'react';
import Card from '../../layout/card/Card';
import Stack from '../../layout/stack/Stack';
import Subheading from '../../design/subheading/Subheading';
import Heading from '../../design/heading/Heading';

import GlanceLineGraph from '../graph/GlanceLineGraph';
import { BalancerData } from '../../../api/datatypes';
import { last } from 'lodash';
import styled, { css } from 'styled-components';
import Box from '../../layout/box/Box';

type Props = {
    heading: string;
    subtext?: string;
    icon?: React.ReactElement;
    data: number[];
    timestamps: number[];
    value: number | string;
};

const NoOverflowCard = styled(Card)`
    overflow: hidden;
    min-height: 200px;
`;

const GraphContainer = styled(Box)`
    position: absolute;
    top: 55px;
    width: 100%;
    height: 150px;
`;

const Statistic = (props: Props) => {
    const { heading, data, timestamps, value } = props;
    const graphData = {
        values: data,
        axis: timestamps,
        name: heading,
    }

    return (
        <NoOverflowCard spanX={4}>
            <Stack>
                <Stack gap='small' paddingX='large' paddingTop='large'>
                    <Subheading>{heading}</Subheading>
                    <Heading level='3'>{value}</Heading>
                </Stack>
                <GraphContainer>
                    <GlanceLineGraph data={graphData} />
                </GraphContainer>
            </Stack>
        </NoOverflowCard>
    );
};

export default Statistic;
