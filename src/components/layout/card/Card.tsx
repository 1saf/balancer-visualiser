import React, { FC } from 'react';
import styled from 'styled-components';
import Box, { BoxProps } from '../box/Box';

type Props = {} & BoxProps;

const StyledCard = styled(Box)`
    background-color: ${props => props.theme.foreground};
    border: 1px solid ${props => props.theme.borderColor};
    height: fit-content;
`;

const Card: FC<Props> = (props) => {
    return <StyledCard {...props} />;
};

export default Card;
