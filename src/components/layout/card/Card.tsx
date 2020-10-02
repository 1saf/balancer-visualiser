import React, { FC } from 'react';
import styled from 'styled-components';
import Box, { BoxProps } from '../box/Box';

type Props = {} & BoxProps;

const StyledCard = styled(Box)`
    position: relative;
    background-color: ${props => props.theme.foreground};
    border-radius: 10px;
    // border: 2px solid ${props => props.theme.borderColor};
    box-shadow: 0 0 0 1px ${props => props.theme.borderColor};
`;

const Card: FC<Props> = (props) => {
    return <StyledCard {...props} />;
};

export default Card;
