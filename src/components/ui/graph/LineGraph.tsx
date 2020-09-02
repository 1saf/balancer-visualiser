import React, { FC } from 'react';
import Card from '../../layout/card/Card';
import { ResponsiveLine } from '@nivo/line';
import styled from 'styled-components';

type Props = {};


const StyledLineGraphContainer = styled(Card)`
    min-height: 400px;
    height: 400px;
`;

const LineGraph: FC<Props> = props => {
    const {} = props;
    return (
        <StyledLineGraphContainer spanX={12} padding='large' marginTop='x-large'>
        </StyledLineGraphContainer>
    );
};

export default LineGraph;
