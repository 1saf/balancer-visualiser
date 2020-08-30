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
};


const StyledBox = styled.div<BoxProps>`
    ${resolveSpacing('p')}
    ${props => props.spanX && `grid-column: span ${props.spanX};`}
`;

const Box: FC<BoxProps> = props => {
    return <StyledBox {...props}>{props.children}</StyledBox>;
};

export default Box;
