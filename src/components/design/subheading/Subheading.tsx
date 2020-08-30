import React, { FC } from 'react';
import styled from 'styled-components';

type Props = {}

const StyledSubheading = styled.h5`
    font-size: 0.87rem;
    color: ${props => props.theme.subheadingColor};
    text-transform: uppercase;
    font-weight: 700;
    user-select: none;
`;

const Subheading: FC<Props> = (props) => {
    const { children } = props;
    return <StyledSubheading>{children}</StyledSubheading>
}

export default Subheading;