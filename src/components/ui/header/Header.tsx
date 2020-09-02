import React, { FC } from 'react';
import Box from '../../layout/box/Box';
import Pebbles from './pebbles.svg';
import styled from 'styled-components';

type Props = {};

const StyledPebbles = styled(Pebbles)`
    height: 40px;
    width: 40px;
`;

const StyledHeader = styled(Box)`
    background: #fff;
    width: 100%;
    display: grid;
    grid-template-columns: repeat(12, 55px);
    grid-column-gap: 2rem;
    grid-row-gap: 1rem;
    justify-content: center;
    border-bottom: 1px solid ${props => props.theme.borderColor};
`;

const Header: FC<Props> = props => {
    const {} = props;
    return (
        <StyledHeader padding='medium'>
            <Box spanX={12}>
                <StyledPebbles />
            </Box>
        </StyledHeader>
    );
};

export default Header;
