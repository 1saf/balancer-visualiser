import React, { FC, useState, useCallback } from 'react';
import styled from 'styled-components';
import Stack from '../../layout/stack/Stack';
import { AnimatePresence } from 'framer-motion';

import { UisAngleDown } from '@iconscout/react-unicons-solid';
import Box from '../../layout/box/Box';

export type DropdownOption = {
    label: string;
    value: string;
    description?: string;
};

type DropdownProps = {
    icon?: React.ReactNode;
    options: DropdownOption[];
    onSelected?: (option: DropdownOption) => void;
    silent?: boolean;
    menuWidth?: string;
};

type DropdownItemProps = {
    option: DropdownOption;
    onClick: (option: DropdownOption) => void;
};

const StyledDropdownItem = styled.button`
    font-size: 1rem;
    color: ${props => props.theme.actionButtonTextColor};
    cursor: pointer;
    background: white;
    border: none;
    padding: 0.75rem 1rem;
    text-align: left;
    outline: none;
    &:hover {
        background: ${props => props.theme.actionButtonHover};
        color: ${props => props.theme.dropdownItemHoverColor};
    }
    &:first-child {
        border-top-right-radius: 5px;
        border-top-left-radius: 5px;
    }
    &:last-child {
        border-bottom-right-radius: 5px;
        border-bottom-left-radius: 5px;
    }
`;

const OptionDescription = styled.span`
    font-size: 0.75rem;
    display: inline-block;
`;

const DropdownItem: FC<DropdownItemProps> = props => {
    const { option, onClick } = props;
    return (
        <StyledDropdownItem onClick={() => onClick(option)} padding='small'>
            <Stack gap='x-small'>
                <Box>{option?.label}</Box>
                {option?.description && <OptionDescription>{option?.description}</OptionDescription>}
            </Stack>
        </StyledDropdownItem>
    );
};

const StyledDropdownButton = styled.button<Partial<DropdownProps>>`
    position: relative;
    background: white;
    border-radius: 3px;
    border: none;
    ${props => !props.silent && `box-shadow: 0px 1px 2px rgba(24, 25, 33, 0.3), 0px 0px 3px rgba(24, 25, 33, 0.02);`}
    outline: none;
    padding: ${props => (!props.silent ? '0.35rem 0.5rem' : '0')};
    font-size: ${props => (!props.silent ? `1rem` : `1rem`)};
    color: ${props => props.theme.actionButtonTextColor};
    font-weight: ${props => (!props.silent ? '500' : '700')};
    cursor: pointer;
    ${props => !props.silent && `min-width: 125px;`}
    &:active {
        ${props => !props.silent && `box-shadow: 0px 1px 2px rgba(24, 25, 33, 0.2), 0px 0px 3px rgba(24, 25, 33, 0.02);`}
    }
    &:hover {
        color: ${props => (!props.silent ? props.theme.actionButtonTextColor : props.theme.silentdropdownHover)};
    }
`;

const StyledDropdownMenu = styled(Stack)<{ minWidth?: string }>`
    background: white;
    position: absolute;
    top: 2rem;
    left: 0;
    right: 0;
    box-shadow: 0px 10px 40px rgba(100, 100, 100, 0.1), 0px 10px 20px rgba(100, 100, 100, 0.2);
    border-radius: 10px;
    z-index: 2;
    min-width: ${props => props?.minWidth || '100%'};
`;

const StyledDropdownContainer = styled(Stack)`
    position: relative;
`;

const springConfig = { type: 'spring', damping: 35, stiffness: 600, mass: 1.5 };

const Dropdown: FC<DropdownProps> = props => {
    const { icon, options, onSelected, menuWidth, silent } = props;
    const [optionsVisible, setOptionsVisible] = useState(false);
    const [currentOption, setCurrentOption] = useState<DropdownOption>(options[0]);

    const toggleVisibility = () => {
        setOptionsVisible(!optionsVisible);
    };

    const handleOptionSelected = (option: DropdownOption) => {
        setCurrentOption(option);
        toggleVisibility();
        onSelected && onSelected(option);
    };

    return (
        <StyledDropdownContainer gap='none'>
            <StyledDropdownButton onClick={toggleVisibility} silent={silent}>
                <Stack align='center' orientation='horizontal' gap='x-small'>
                    <Stack orientation='horizontal' gap='x-small'>
                        {icon}
                        <span>{currentOption?.label}</span>
                    </Stack>
                    <UisAngleDown size='18' />
                </Stack>
            </StyledDropdownButton>
            <AnimatePresence>
                {optionsVisible && (
                    <StyledDropdownMenu
                        transition={springConfig}
                        initial={{ opacity: 0, transformOrigin: 'top', transform: 'scale(0.95)' }}
                        animate={{ opacity: 1, transformOrigin: 'top', transform: 'scale(1.0001)' }}
                        exit={{ opacity: 0, transformOrigin: 'top', transform: 'scale(0.95)' }}
                        gap='x-small'
                        minWidth={menuWidth}
                    >
                        {(options || []).map(option => (
                            <DropdownItem onClick={handleOptionSelected} option={option} key={option.value} />
                        ))}
                    </StyledDropdownMenu>
                )}
            </AnimatePresence>
        </StyledDropdownContainer>
    );
};

export default Dropdown;
