import React, { FC } from 'react';
import styled from 'styled-components';
import Box, { BoxProps } from '../box/Box';

type Props = {
    columnGap?: string;
} & BoxProps;

const StyledGrid = styled(Box)<Props>`
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-row-gap: 1rem;
    grid-column-gap: ${props => props.columnGap || '1.5rem'};

    @media (min-width: 1024px) {
        grid-template-columns: repeat(12, 75px);
        grid-column-gap: ${props => props.columnGap || '1.5rem'};
        grid-row-gap: 1.5rem;
        justify-content: center;
    }
`;

const Grid: FC<Props> = props => {
    const { children } = props;
    return <StyledGrid {...props}>{children}</StyledGrid>;
};

export default Grid;
