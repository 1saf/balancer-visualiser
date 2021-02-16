import React, { FC } from "react";
import styled from "styled-components";
import { Option } from "../../../api/datatypes";
import Stack from "../../layout/stack/Stack";
import { getThemeValue } from "../../theme_utils";

type Props = {
    value: string;
    options: Option[];
    setValue: (option: Option) => void;
    size?: "small" | "large";
    weight?: 'primary' | 'secondary';
};

type ButtonGroupButtonProps = {
    active?: boolean;
    size?: "small" | "large";
    weight: 'primary' | 'secondary';
};

const StyledButtonGroupButton = styled.button<ButtonGroupButtonProps>`
    position: relative;
    background: ${(props) =>
        props.active
            ? getThemeValue(`buttonGroup.${props.weight}.activeBackground`)(props)
            : getThemeValue(`buttonGroup.${props.weight}.background`)(props)};
    box-shadow: none;
    border: none;
    outline: none;
    font-size: ${(props) => (props.size == "small" ? "0.75rem" : "0.95rem")};
    padding: ${(props) =>
        props.size == "small" ? "0.4rem 0.25rem" : "0.5rem 0.35rem"};
    min-width: ${(props) => (props.size == "small" ? "50px" : "60px")};
    color: ${(props) =>
        props.active
            ? getThemeValue(`buttonGroup.${props.weight}.activeColor`)(props)
            : getThemeValue(`buttonGroup.${props.weight}.inactiveColor`)(props)};
    font-weight: 700;
    cursor: pointer;

    &:hover {
        color: ${(props) => getThemeValue(`buttonGroup.${props.weight}.hoverColor`)(props)};
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
    box-shadow: ${getThemeValue("shadow")};
    border-radius: 10px;
    border: 1px solid ${getThemeValue("buttonGroup.borderColor")};
    width: fit-content;
`;

const ButtonGroup: FC<Props> = (props) => {
    const { value, options = [], setValue, size, weight = 'primary' } = props;

    return (
        <StyledButtonGroup orientation="horizontal">
            {options.map((option) => (
                <StyledButtonGroupButton
                    size={size}
                    key={`btn-grp-op-${option?.value}-${option?.label}`}
                    onClick={() => setValue(option)}
                    active={value === `${option?.value}-${option?.label}`}
                    weight={weight}
                >
                    {option?.label}
                </StyledButtonGroupButton>
            ))}
        </StyledButtonGroup>
    );
};

export default ButtonGroup;
