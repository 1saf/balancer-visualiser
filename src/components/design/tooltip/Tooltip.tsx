import React, { FC } from 'react';
import Tippy from '@tippyjs/react/headless';
import styled from 'styled-components';
import { useSpring } from 'framer-motion';
import Box from '../../layout/box/Box';
import { getThemeValue } from '../../theme_utils';
import { tokens } from '../../../style/Theme';

type Props = {
    tip: string;
};

const StyledTippy = styled(Box)`
    background: ${props => props.theme.tooltipBackgroundColor};
    color: ${tokens.colors.gray600};
    border-radius: 4px;
    box-shadow: ${getThemeValue('shadow')};
    font-family: Inter;
    font-size: 0.875rem;
    font-weight: 600;
`;

const initialScale = 0.95;
const springConfig = { damping: 10, stiffness: 100, mass: 0.3 };

const Tooltip: FC<Props> = ({ children, tip }) => {
    const opacity = useSpring(0, springConfig);
    const scale = useSpring(initialScale, springConfig);
    const rotate = useSpring(-15, springConfig);

    const onMount = () => {
        scale.set(1);
        opacity.set(1);
        rotate.set(-15);
    };

    const onHide = ({ unmount }: { unmount: any }) => {
        const cleanup = scale.onChange(value => {
            if (value <= initialScale) {
                cleanup();
                unmount();
            }
        });

        scale.set(initialScale);
        opacity.set(0);
        rotate.set(-15);
    };

    return (
        <Tippy
            render={attrs => (
                <StyledTippy padding='medium' style={{ scale, opacity, transform: `rotateX(${rotate}deg)` }} {...attrs}>
                    <span>{tip}</span>
                </StyledTippy>
            )}
            animation={true}
            onMount={onMount}
            onHide={onHide}
            placement='bottom'
        >
            {children as React.ReactElement}
        </Tippy>
    );
};

export default Tooltip;
