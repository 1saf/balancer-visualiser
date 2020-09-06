import React, { FC } from 'react';
import styled from 'styled-components';

type Props = {};

const StyledActionButton = styled.button<Props>`
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    font-weight: 700;
    border: 1px ${props => props.theme.borderColor} solid;
    border-radius: 5px;
    background: white;
    cursor: pointer;
    color: ${props => props.theme.actionButtonTextColor};
    &:hover{
        background: ${props => props.theme.actionButtonHover};
    }
`;

const ActionButton: FC<Props> = props => {
    const { children } = props;
    return <StyledActionButton {...props}>{children}</StyledActionButton>;
};

export default ActionButton;
