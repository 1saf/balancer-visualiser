import React, { FC } from 'react';
import { Spacing, SpacingRemConfig, ResponsiveProp, getPaddingString, Padding, Devices, resolveSpacing } from '../layout.t';
import styled from 'styled-components';
import { pick } from 'lodash';

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
    ${resolveSpacing}
`;

const Box: FC<Props> = props => {
    return <StyledBox {...props}>{props.children}</StyledBox>;
};

export default Box;
