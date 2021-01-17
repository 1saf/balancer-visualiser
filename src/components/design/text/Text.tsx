import React, { ReactNode } from 'react';
import styled from 'styled-components';

type FontWeight = 'regular' | 'medium' | 'bold' | 'semibold';

type Props = {
    children: ReactNode;
    weight?: FontWeight;
    size?: string;
    align?: 'left' | 'right' | 'center';
}

const weightMap: Record<FontWeight, string> = {
    'bold': '700',
    'medium': '500',
    'regular': '400',
    'semibold': '600',
};

const StyledText = styled.span<Props>`
    font-weight: ${props => weightMap[props.weight]};
    font-size: ${props => props.size};
    text-align: ${props => props.align};
`;

export const Text = (props: Props) => {
    const { children, size = '1rem', weight = 'regular', align = 'left' } = props;
    return (
        <StyledText align={align} size={size} weight={weight}>{children}</StyledText>
    )
}

export default Text;