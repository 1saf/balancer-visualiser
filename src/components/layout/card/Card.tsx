import React, { FC } from 'react';
import styled from 'styled-components';
import Box, { BoxProps } from '../box/Box';

type Props = {} & BoxProps;

const StyledCard = styled(Box)`
    background-color: ${props => props.theme.foreground};
    border: 1px solid ${props => props.theme.emphasizedBorder};
    height: fit-content;
    border-radius: 4px;
    filter: drop-shadow(0px 2px 1px rgba(24, 25, 33, 0.05));
    `;

const Card: FC<Props> = (props) => {
    return <StyledCard {...props} />;
};

export default Card;
