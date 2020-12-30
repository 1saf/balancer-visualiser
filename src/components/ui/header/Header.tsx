import React, { FC } from 'react';
import Box from '../../layout/box/Box';
import Pebbles from '../../../assets/pebbles.svg';
import styled from 'styled-components';
import { tokens } from '../../../style/Theme';
import Heading from '../../design/heading/Heading';
import Stack from '../../layout/stack/Stack';
import Grid from '../../layout/grid/Grid';

type Props = {
    heading: string;
};

const StyledPebbles = styled(Pebbles)`
    height: 35px;
    width: 35px;
    color: ${props => tokens.colors.white};
`;

const StyledHeader = styled(Grid)`
`;

const StyledHeaderLink = styled.a`
    cursor: pointer;
    color: #fff;
    padding: 0.5rem 0.5rem;
    padding-bottom: 0.6rem;
    border-radius: 3px;
    text-decoration: none;

    &:hover {
        background: ${tokens.colors.ultramarine};
    }
`;

const Header: FC<Props> = props => {
    return (
        <Box>
            <StyledHeader paddingY='large' paddingX={['base', 'base', 'base', 'none']}>
                <Box spanX={12}>
                    <Stack orientation='horizontal' gap='x-large'>
                        <StyledPebbles />
                        <Stack orientation='horizontal' align='center' gap='small'>
                            <StyledHeaderLink href='/'>Dashboard</StyledHeaderLink>
                            <StyledHeaderLink href='/tokens'>Tokens</StyledHeaderLink>
                        </Stack>
                    </Stack>
                </Box>
            </StyledHeader>
        </Box>
    );
};

export default Header;
