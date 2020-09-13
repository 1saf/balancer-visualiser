import React, { FC } from 'react';
import styled from 'styled-components';
import Box, { BoxProps } from '../box/Box';

type Props = {} & BoxProps;

const StyledCard = styled(Box)`
    position: relative;
    background-color: ${props => props.theme.foreground};
    height: fit-content;
    border-radius: 15px;
    box-shadow: 0px 10px 40px rgba(100, 100, 100, 0.1), 0px 10px 20px rgba(100, 100, 100, 0.05);
`;

const Card: FC<Props> = (props) => {
    return <StyledCard {...props} />;
};

export default Card;
