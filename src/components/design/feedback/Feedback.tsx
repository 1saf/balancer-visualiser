import React, { FC } from 'react';
import styled from 'styled-components';
import { tokens } from '../../../style/Theme';
import Box, { BoxProps } from '../../layout/box/Box';

type Emotion = 'positive' | 'negative' | 'neutral';

type Props = {
    emotion: Emotion;
} & BoxProps;

const emotionColor: Record<Emotion, string> = {
    positive: tokens.colors.green400,
    neutral: tokens.colors.blue500,
    negative: tokens.colors.congo_pink,
}

const StyledFeedback = styled(Box)<Props>`
    border: 2px solid ${props => emotionColor[props.emotion]};
    background: #FFF;
    border-radius: 8px;
`;

const Feedback: FC<Props> = props => {
    const { emotion, children } = props;
    return <StyledFeedback padding='large' emotion={emotion} {...props}>{children}</StyledFeedback>;
};

export default Feedback;
