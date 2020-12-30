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
        <StyledFooter padding='large' align='center'>
            <StyledFooterText>Made by the Balancer Dashboard Team &lt;@1saf and @tongnk&gt;</StyledFooterText>
        </StyledFooter>
    );
};

export default Footer;
