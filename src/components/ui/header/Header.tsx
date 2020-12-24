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
    height: 40px;
    width: 40px;
    color: ${props => tokens.colors.white};
`;

const StyledHeader = styled(Grid)`
    background: #fff;
    background: ${props => props.theme.headerBg};
`;

const StyledHeaderLink = styled.a`
    cursor: pointer;
    color: #fff;
    padding: 0.5rem 0.5rem;
    padding-bottom: 0.6rem;
    border-radius: 3px;
    text-decoration: none;

    &:hover {
        background: ${tokens.colors.gray800};
        // color: ${props => props.theme.primary};
        
    }
`;

const StyledCrumbs = styled(Grid)`
    border-bottom: 2px solid ${props => props.theme.borderColor};
`;

const Header: FC<Props> = props => {
    const { heading } = props;
    return (
        <Stack>
            <StyledHeader paddingY='medium' paddingX={['base', 'base', 'base', 'none']}>
                <Box spanX={12}>
                    <Stack orientation='horizontal'>
                        <StyledPebbles />
                        <Stack marginLeft='base' orientation='horizontal' align='center'>
                            <StyledHeaderLink href='/'>Dashboard</StyledHeaderLink>
                            <StyledHeaderLink href='/tokens'>Tokens</StyledHeaderLink>
                        </Stack>
                    </Stack>
                </Box>
            </StyledHeader>
            <StyledCrumbs
                background={tokens.colors.white}
                paddingBottom='base'
                paddingTop='base'
                paddingX={['base', 'base', 'base', 'none']}
            >
                <Heading level='4'>{heading}</Heading>
            </StyledCrumbs>
        </Stack>
    );
};

export default Header;
