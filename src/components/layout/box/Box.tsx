import React, { FC } from 'react';
import { Spacing, ResponsiveProp, resolveSpacing } from '../layout.t';
import styled from 'styled-components';

export type BoxProps = {
    padding?: ResponsiveProp<Spacing>;
    paddingLeft?: ResponsiveProp<Spacing>;
    paddingRight?: ResponsiveProp<Spacing>;
    paddingTop?: ResponsiveProp<Spacing>;
    paddingBottom?: ResponsiveProp<Spacing>;
    paddingX?: ResponsiveProp<Spacing>;
    paddingY?: ResponsiveProp<Spacing>;
    className?: string;
    spanX?: number;
    width?: string;
    height?: string;
};


const StyledBox = styled.div<BoxProps>`
    ${resolveSpacing('p')}
    ${props => props.spanX && `grid-column: span ${props.spanX};`}
    ${props => props.width && `width: ${props.width};`}
    ${props => props.height && `height: ${props.height};`}
`;

const Box: FC<BoxProps> = props => {
    return <StyledBox {...props}>{props.children}</StyledBox>;
};

export default Box;
