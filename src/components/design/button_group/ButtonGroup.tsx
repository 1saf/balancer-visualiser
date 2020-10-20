import React, { FC } from 'react';
import styled from 'styled-components';
import { Option } from '../../../api/datatypes';
import Stack from '../../layout/stack/Stack';

type Props = {
    value: string;
    options: Option[];
    setValue: (option: Option) => void;
};

type ButtonGroupButtonProps = {
    active?: boolean;
};

const StyledButtonGroupButton = styled.button<ButtonGroupButtonProps>`
    position: relative;
    background: ${props => props.active ? props.theme.silentdropdownButtonHover : 'white'};
    border: ${props => props.active ? `2px solid ${props.theme.primary}`: '2px solid transparent'};
    outline: none;
    padding: 0.35rem 0.35rem;
    font-size: 1rem;
    color: ${props => props.active ? props.theme.silentdropdownHover : props.theme.actionButtonTextColor};
    font-weight: 700;
    cursor: pointer;

    min-width: 100px;
    &:hover {
        color: ${props => props.theme.silentdropdownHover};
        background: ${props => props.theme.silentdropdownButtonHover};
    }
    &:first-child {
        border-top-left-radius: 20px;
        border-bottom-left-radius: 20px;
    }
    &:last-child {
        border-top-right-radius: 20px;
        border-bottom-right-radius: 20px;
    }
`;

const StyledButtonGroup = styled(Stack)`
    box-shadow: 0 1px 5px 0 rgba(22, 29, 37, 0.09);
    border-radius: 20px;
`;

const ButtonGroup: FC<Props> = props => {
    const { value, options = [], setValue } = props;

    return (
        <StyledButtonGroup orientation='horizontal'>
            {options.map(option => (
                <StyledButtonGroupButton key={`btn-grp-op-${option?.value}-${option?.label}`} onClick={() => setValue(option)} active={value === `${option?.value}-${option?.label}`}>
                    {option?.label}
                </StyledButtonGroupButton>
            ))}
        </StyledButtonGroup>
    );
};

export default ButtonGroup;
