import React, { FC } from 'react';
import { Spacing, SpacingRemConfig, ResponsiveProp, getPaddingString } from '../layout.t';
import styled from 'styled-components';

type Props = {
    padding?: ResponsiveProp<Spacing>;
    paddingLeft?: ResponsiveProp<Spacing>;
    paddingRight?: ResponsiveProp<Spacing>;
    paddingTop?: ResponsiveProp<Spacing>;
    paddingBottom?: ResponsiveProp<Spacing>;
    paddingX?: ResponsiveProp<Spacing>;
    paddingY?: ResponsiveProp<Spacing>;
};

const StyledBox = styled.div<Props>`
    ${({ padding }) => (padding && !Array.isArray(padding) && getPaddingString('padding', padding))}
    ${({ paddingBottom }) => (paddingBottom && !Array.isArray(paddingBottom) && getPaddingString('paddingBottom', paddingBottom))}
    ${({ paddingTop }) => (paddingTop && !Array.isArray(paddingTop) && getPaddingString('paddingTop', paddingTop))}
    ${({ paddingX }) => (paddingX && !Array.isArray(paddingX) && getPaddingString('paddingX', paddingX))}
    ${({ paddingY }) => (paddingY && !Array.isArray(paddingY) && getPaddingString('paddingY', paddingY))}
    ${({ paddingLeft }) => (paddingLeft && !Array.isArray(paddingLeft) && getPaddingString('paddingLeft', paddingLeft))}
    ${({ paddingRight }) => (paddingRight && !Array.isArray(paddingRight) && getPaddingString('paddingRight', paddingRight))}
    ${({ padding }) => ((Array.isArray(padding) && padding[0]) && getPaddingString('padding', padding[0]))}

    @media only screen and (min-width: 640px) {
        ${({ padding }) => ((Array.isArray(padding) && padding[1]) && getPaddingString('padding', padding[1]))}
        ${({ paddingLeft }) => ((Array.isArray(paddingLeft) && paddingLeft[1]) && getPaddingString('paddingLeft', paddingLeft[1]))}
        ${({ paddingRight }) => ((Array.isArray(paddingRight) && paddingRight[1]) && getPaddingString('paddingRight', paddingRight[1]))}
        ${({ paddingTop }) => ((Array.isArray(paddingTop) && paddingTop[1]) && getPaddingString('paddingTop', paddingTop[1]))}
        ${({ paddingBottom }) => ((Array.isArray(paddingBottom) && paddingBottom[1]) && getPaddingString('paddingBottom', paddingBottom[1]))}
        ${({ paddingX }) => ((Array.isArray(paddingX) && paddingX[1]) && getPaddingString('paddingX', paddingX[1]))}
        ${({ paddingY }) => ((Array.isArray(paddingY) && paddingY[1]) && getPaddingString('paddingY', paddingY[1]))}
    }

    @media only screen and (min-width: 768px) {
        ${({ padding }) => ((Array.isArray(padding) && padding[2]) && getPaddingString('padding', padding[2]))}
        ${({ paddingLeft }) => ((Array.isArray(paddingLeft) && paddingLeft[2]) && getPaddingString('paddingLeft', paddingLeft[2]))}
        ${({ paddingRight }) => ((Array.isArray(paddingRight) && paddingRight[2]) && getPaddingString('paddingRight', paddingRight[2]))}
        ${({ paddingTop }) => ((Array.isArray(paddingTop) && paddingTop[2]) && getPaddingString('paddingTop', paddingTop[2]))}
        ${({ paddingBottom }) => ((Array.isArray(paddingBottom) && paddingBottom[2]) && getPaddingString('paddingBottom', paddingBottom[2]))}
        ${({ paddingX }) => ((Array.isArray(paddingX) && paddingX[2]) && getPaddingString('paddingX', paddingX[2]))}
        ${({ paddingY }) => ((Array.isArray(paddingY) && paddingY[2]) && getPaddingString('paddingY', paddingY[2]))}
    }

    @media only screen and (min-width: 1024px) {
        ${({ padding }) => ((Array.isArray(padding) && padding[3]) && getPaddingString('padding', padding[3]))}
        ${({ paddingLeft }) => ((Array.isArray(paddingLeft) && paddingLeft[3]) && getPaddingString('paddingLeft', paddingLeft[3]))}
        ${({ paddingRight }) => ((Array.isArray(paddingRight) && paddingRight[3]) && getPaddingString('paddingRight', paddingRight[3]))}
        ${({ paddingTop }) => ((Array.isArray(paddingTop) && paddingTop[3]) && getPaddingString('paddingTop', paddingTop[3]))}
        ${({ paddingBottom }) => ((Array.isArray(paddingBottom) && paddingBottom[3]) && getPaddingString('paddingBottom', paddingBottom[3]))}
        ${({ paddingX }) => ((Array.isArray(paddingX) && paddingX[3]) && getPaddingString('paddingX', paddingX[3]))}
        ${({ paddingY }) => ((Array.isArray(paddingY) && paddingY[3]) && getPaddingString('paddingY', paddingY[3]))}
    }

    @media only screen and (min-width: 1280px) {
        ${({ padding }) => ((Array.isArray(padding) && padding[4]) && getPaddingString('padding', padding[4]))}
        ${({ paddingLeft }) => ((Array.isArray(paddingLeft) && paddingLeft[4]) && getPaddingString('paddingLeft', paddingLeft[4]))}
        ${({ paddingRight }) => ((Array.isArray(paddingRight) && paddingRight[4]) && getPaddingString('paddingRight', paddingRight[4]))}
        ${({ paddingTop }) => ((Array.isArray(paddingTop) && paddingTop[4]) && getPaddingString('paddingTop', paddingTop[4]))}
        ${({ paddingBottom }) => ((Array.isArray(paddingBottom) && paddingBottom[4]) && getPaddingString('paddingBottom', paddingBottom[4]))}
        ${({ paddingX }) => ((Array.isArray(paddingX) && paddingX[4]) && getPaddingString('paddingX', paddingX[4]))}
        ${({ paddingY }) => ((Array.isArray(paddingY) && paddingY[4]) && getPaddingString('paddingY', paddingY[4]))}
    }
`;

const Box: FC<Props> = props => {
    return <StyledBox {...props}>{props.children}</StyledBox>;
};

export default Box;
