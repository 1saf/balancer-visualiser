import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

type Props = {
    isActive?: boolean;
    onClick: any;
};

const StyledToggleContainer = styled(motion.div)<{ isActive: boolean }>`
    width: 40px;
    height: 25px;
    border-radius: 100px;
    padding: 3px;
    display: flex;
    cursor: pointer;
    background-color: ${props => (props.isActive ? '#22cc88' : '#dddddd')};
    justify-content: ${props => (props.isActive ? 'flex-end' : 'flex-start')};
`;

const StyledToggleHandle = styled(motion.div)`
    width: 18px;
    height: 18px;
    background-color: #ffffff;
    border-radius: 200px;
    box-shadow: 1px 2px 3px rgba(0, 0, 0, 0.02);
`;

export function Toggle({ isActive, onClick }: Props) {
    const className = `switch ${isActive ? 'on' : 'off'}`;

    return (
        <StyledToggleContainer onClick={onClick} layout isActive={isActive}>
            <StyledToggleHandle layout />
        </StyledToggleContainer>
    );
}