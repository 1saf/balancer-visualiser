import React from 'react';
import styled from 'styled-components';
import { useAppContext } from '../../../layouts/AppLayout';
import { tokens } from '../../../style/Theme';
import { Toggle } from '../../design/toggle/Toggle';
import Box from '../../layout/box/Box';
import Stack from '../../layout/stack/Stack';

type Props = {};

const StyledFooter = styled(Stack)`
    background: ${tokens.colors.gray900};
`;

const StyledFooterText = styled.span`
    color: ${tokens.colors.gray100};
    font-size: 0.85rem;
`;

export const Footer = (props: Props) => {
    const { theme, setTheme } = useAppContext();

    const toggleTheme = () => {
        if (theme === 'dark') setTheme('light');
        if (theme === 'light') setTheme('dark');
    };

    return (
        <StyledFooter padding='large' align='end'>
            <Stack orientation='horizontal' gap='small' align='center'>
                <StyledFooterText>Dark Mode</StyledFooterText>
                <Toggle isActive={theme === 'dark'} onClick={toggleTheme} />
            </Stack>
        </StyledFooter>
    );
};

export default Footer;
