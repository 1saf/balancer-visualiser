import React, { FC } from 'react';
import { Spacing, ResponsiveProp, resolveSpacing } from '../layout.t';
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
    ${resolveSpacing('p')}
`;

const Box: FC<Props> = props => {
    return <StyledBox {...props}>{props.children}</StyledBox>;
};

export default Box;
