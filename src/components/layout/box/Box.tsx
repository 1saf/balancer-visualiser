import React, { FC, forwardRef, RefObject } from 'react';
import { Spacing, ResponsiveProp, resolveSpacing, resolveResponsiveCSSProperty } from '../layout.t';
import styled from 'styled-components';
import { motion } from 'framer-motion';

export type BoxProps = {
    padding?: ResponsiveProp<Spacing>;
    paddingLeft?: ResponsiveProp<Spacing>;
    paddingRight?: ResponsiveProp<Spacing>;
    paddingTop?: ResponsiveProp<Spacing>;
    paddingBottom?: ResponsiveProp<Spacing>;
    paddingX?: ResponsiveProp<Spacing>;
    paddingY?: ResponsiveProp<Spacing>;
    margin?: ResponsiveProp<Spacing>;
    marginLeft?: ResponsiveProp<Spacing>;
    marginRight?: ResponsiveProp<Spacing>;
    marginTop?: ResponsiveProp<Spacing>;
    marginBottom?: ResponsiveProp<Spacing>;
    marginX?: ResponsiveProp<Spacing>;
    marginY?: ResponsiveProp<Spacing>;
    className?: string;
    spanX?: ResponsiveProp<number>;
    width?: string;
    height?: string;
    ref?: React.Ref<HTMLDivElement>;
    initial?: any;
    animate?: any;
    exit?: any;
    transition?: any;
    style?: any;
    background?: string;
    overflowY?: 'auto' | 'scroll' | 'none' | 'hidden';
    float?: 'left' | 'right';
};


const StyledBox = styled(motion.div)<BoxProps>`
    ${resolveSpacing('p')}
    ${resolveSpacing('m')}
    ${resolveResponsiveCSSProperty('width')}
    ${resolveResponsiveCSSProperty('grid-column', 'spanX', 'span')}
    ${props => props.width && `width: ${props.width};`}
    ${props => props.height && `height: ${props.height};`}
    ${props => props.background && `background: ${props.background};`}
    ${props => props.overflowY && `overflow-y: ${props.overflowY};`}
    ${props => props.float && `float: ${props.float};`}
`;

const Box: FC<BoxProps> = forwardRef((props, ref) => {
    return <StyledBox {...props} ref={ref}>{props.children}</StyledBox>;
});

export default Box;
