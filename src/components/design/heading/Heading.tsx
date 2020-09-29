import React, { FC } from 'react';
import styled from 'styled-components';

type Props = {
    level: '1' | '2' | '3' | '4' | '5' | '6';
    className?: string;
    weight?: string;
    color?: string;
};

const StyledHeading = styled.div<Props>`
    font-size: ${props => `${props.theme.typography[`heading_${props.level}`]}rem`};
    font-weight: ${props => `${props.weight || props.theme.fontWeight[`heading_${props.level}`]}`};
    color: ${props => `${props.color || props.theme.headingColor}`};
    letter-spacing: -1px;
    user-select: none;
`

const Heading: FC<Props> = props => {
    return <StyledHeading {...props} as={`h${props.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'} />
};

export default Heading;
