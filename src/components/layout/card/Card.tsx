import React, { FC } from 'react';
import styled from 'styled-components';
import Box, { BoxProps } from '../box/Box';

type Props = {} & BoxProps;

const StyledCard = styled(Box)`
    position: relative;
    background-color: ${props => props.theme.foreground};
    height: fit-content;
    border-radius: 8px;
    box-shadow: 0px 1px 5px rgba(83, 109, 254, 0.1), 0px 1px 2px rgba(24, 25, 33, 0.2);
`;

const Card: FC<Props> = (props) => {
    return <StyledCard {...props} />;
};

export default Card;
