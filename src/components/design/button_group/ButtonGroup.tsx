import React, { FC } from 'react';
import styled from 'styled-components';
import { Option } from '../../../api/datatypes';
import Stack from '../../layout/stack/Stack';
import { getThemeValue } from '../../theme_utils';

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
    background: ${props => (props.active ? getThemeValue('buttonGroup.activeBackground')(props) : getThemeValue('buttonGroup.background')(props))};
    box-shadow: none;
    border: none;
    outline: none;
    padding: 0.5rem 0.5rem;
    font-size: 0.95rem;
    color: ${props => (props.active ? getThemeValue('buttonGroup.activeColor')(props) : getThemeValue('buttonGroup.inactiveColor')(props))};
    font-weight: 700;
    cursor: pointer;

    min-width: 100px;
    &:hover {
        color: ${getThemeValue('buttonGroup.activeColor')};
    }
    &:first-child {
        border-top-left-radius: 8px;
        border-bottom-left-radius: 8px;
    }
    &:last-child {
        border-top-right-radius: 8px;
        border-bottom-right-radius: 8px;
    }
`;

const StyledButtonGroup = styled(Stack)`
    box-shadow: ${getThemeValue('shadow')};
    border-radius: 10px;
    border: 1px solid ${getThemeValue('buttonGroup.borderColor')};
`;

const ButtonGroup: FC<Props> = props => {
    const { value, options = [], setValue } = props;

    return (
        <StyledButtonGroup orientation='horizontal'>
            {options.map(option => (
                <StyledButtonGroupButton
                    key={`btn-grp-op-${option?.value}-${option?.label}`}
                    onClick={() => setValue(option)}
                    active={value === `${option?.value}-${option?.label}`}
                >
                    {option?.label}
                </StyledButtonGroupButton>
            ))}
        </StyledButtonGroup>
    );
};

export default ButtonGroup;
