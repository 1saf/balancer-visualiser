import React, { FC } from 'react';
import styled from 'styled-components';
import { tokens } from '../../../style/Theme';
import Box, { BoxProps } from '../../layout/box/Box';
import Stack from '../../layout/stack/Stack';
import InfoCircle from './info-circle.svg';

type Emotion = 'positive' | 'negative' | 'neutral';

type Props = {
    emotion: Emotion;
} & BoxProps;

const emotionColor: Record<Emotion, string> = {
    positive: tokens.colors.green400,
    neutral: tokens.colors.ultramarine,
    negative: tokens.colors.congo_pink,
};

const StyledFeedback = styled(Stack)<Props>`
    & > svg {
        color: ${props => emotionColor[props.emotion]};
    }
    background: #fff;
    border-radius: 8px;
    font-size: 0.75rem;
    color: ${tokens.colors.gray700};
    font-weight: 500;
`;

const Feedback: FC<Props> = props => {
    const { emotion, children } = props;
    return (
        <StyledFeedback orientation='horizontal' gap='small' align='center' emotion={emotion} {...props}>
            <InfoCircle style={{ width: '16px', height: '16px' }} />
            <Box>{children}</Box>
        </StyledFeedback>
    );
};

export default Feedback;
