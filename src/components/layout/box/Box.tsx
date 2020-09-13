import React, { FC, forwardRef, RefObject } from 'react';
import { Spacing, ResponsiveProp, resolveSpacing } from '../layout.t';
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
    spanX?: number;
    width?: string;
    height?: string;
    ref?: React.Ref<RefObject<HTMLDivElement>>;
    initial?: any;
    animate?: any;
    exit?: any;
    transition?: any;
    style?: any;
};


const StyledBox = styled(motion.div)<BoxProps>`
    ${resolveSpacing('p')}
    ${resolveSpacing('m')}
    ${props => props.spanX && `grid-column: span ${props.spanX};`}
    ${props => props.width && `width: ${props.width};`}
    ${props => props.height && `height: ${props.height};`}
`;

const Box: FC<BoxProps> = forwardRef((props, ref) => {
    return <StyledBox {...props} ref={ref}>{props.children}</StyledBox>;
});

export default Box;
