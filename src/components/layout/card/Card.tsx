import React, { FC } from 'react';
import styled from 'styled-components';
import { useAppContext } from '../../../layouts/AppLayout';
import { getThemeValue, ThemeProp } from '../../theme_utils';
import Box, { BoxProps } from '../box/Box';

type Props = {} & BoxProps;

const StyledCard = styled(Box)<ThemeProp>`
    position: relative;
    background-color: ${getThemeValue('card.background')};
    border: 1px solid ${getThemeValue('card.borderColor')};
    border-radius: 10px;
    box-shadow: ${props => props.theme.shadow};
`;

const Card: FC<Props> = (props) => {
    const { theme } = useAppContext();
    return <StyledCard innerTheme={theme} {...props} />;
};

export default Card;
