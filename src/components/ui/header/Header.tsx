import React, { FC } from 'react';
import Box from '../../layout/box/Box';
import Pebbles from '../../../assets/pebbles.svg';
import styled from 'styled-components';
import { tokens } from '../../../style/Theme';
import Heading from '../../design/heading/Heading';
import Stack from '../../layout/stack/Stack';
import Grid from '../../layout/grid/Grid';

type Props = {};

const StyledPebbles = styled(Pebbles)`
    height: 40px;
    width: 40px;
    color: ${props => props.theme.primary};
`;

const StyledHeader = styled(Grid)`
    background: #fff;
    background: ${props => props.theme.headerBg};
    border-bottom: 1px solid ${props => props.theme.borderColor};
`;

const StyledCrumbs = styled(Grid)`
    border-bottom: 1px solid ${props => props.theme.borderColor};
`;

const Header: FC<Props> = props => {
    const {} = props;
    return (
        <Stack>
            <StyledHeader paddingY='medium' paddingX={['base', 'none']}>
                <Box spanX={12}>
                    <StyledPebbles />
                </Box>
            </StyledHeader>
            <StyledCrumbs background={tokens.colors.white} paddingBottom='large' paddingTop='base' paddingX={['base', 'none']}>
                <Heading level='3'>Dashboard</Heading>
            </StyledCrumbs>
        </Stack>
    );
};

export default Header;
