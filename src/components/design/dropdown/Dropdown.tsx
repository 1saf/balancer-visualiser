import React, { FC, useState, useCallback } from 'react';
import styled from 'styled-components';
import Stack from '../../layout/stack/Stack';
import { AnimatePresence } from 'framer-motion';

import { UisAngleDown } from '@iconscout/react-unicons-solid';
import Box from '../../layout/box/Box';

export type DropdownOption = {
    label: string;
    value: string;
};

type DropdownProps = {
    icon?: React.ReactNode;
    options: DropdownOption[];
    onSelected?: (option: DropdownOption) => void;
};

type DropdownItemProps = {
    option: DropdownOption;
    onClick: (option: DropdownOption) => void;
};

const StyledDropdownItem = styled.button`
    font-size: 0.875rem;
    color: ${props => props.theme.actionButtonTextColor};
    cursor: pointer;
    background: white;
    border: none;
    padding: 0.35rem 0.57rem;
    text-align: left;
    outline: none;
    &:hover {
        background: ${props => props.theme.actionButtonHover};
    }
`;

const DropdownItem: FC<DropdownItemProps> = props => {
    const { option, onClick } = props;
    return (
        <StyledDropdownItem onClick={() => onClick(option)} padding='small'>
            {option?.label}
        </StyledDropdownItem>
    );
};

const StyledDropdownButton = styled.button`
    position: relative;
    background: white;
    border-radius: 3px;
    border: none;
    box-shadow: 0px 1px 2px rgba(24, 25, 33, 0.3), 0px 2px 3px rgba(24, 25, 33, 0.02);
    outline: none;
    padding: 0.35rem 0.5rem;
    font-size: 0.875rem;
    color: ${props => props.theme.actionButtonTextColor};
    cursor: pointer;
    min-width: 125px;
    &:active {
        box-shadow: 0px 1px 2px rgba(24, 25, 33, 0.2), 0px 0px 3px rgba(24, 25, 33, 0.02);
    }
`;

const StyledDropdownMenu = styled(Stack)`
    background: white;
    position: absolute;
    top: 30px;
    box-shadow: 0px 2px 3px rgba(24, 25, 33, 0.2), 0px 2px 3px rgba(24, 25, 33, 0.02);
    border-radius: 3px;
    z-index: 2;
    min-width: 100%;
`;

const StyledDropdownContainer = styled(Stack)`
    position: relative;
`;

const Dropdown: FC<DropdownProps> = props => {
    const { icon, options, onSelected } = props;
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
            <StyledDropdownButton onClick={toggleVisibility}>
                <Stack align='center' justify='between' orientation='horizontal' gap='x-small'>
                    <Stack orientation='horizontal' gap='x-small'>
                        {icon}
                        <span>{currentOption?.label}</span>
                    </Stack>
                    <UisAngleDown size='16' />
                </Stack>
            </StyledDropdownButton>
            <AnimatePresence>
                {optionsVisible && (
                    <StyledDropdownMenu
                        transition={{ type: 'spring', stiffness: 200, mass: 0.4 }}
                        initial={{ opacity: 0, transform: 'scale(0.95)' }}
                        animate={{ opacity: 1, transform: 'scale(1)' }}
                        exit={{ opacity: 0, transform: 'scale(0.95)' }}
                        gap='x-small'
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
