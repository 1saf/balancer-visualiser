import React, { FC } from 'react';
import styled from 'styled-components';
import { getThemeValue } from '../../theme_utils';

type Props = {}

const StyledSubheading = styled.h5`
    font-size: 1rem;
    color: ${getThemeValue('heading.secondaryColor')};
    font-weight: 500;
    user-select: none;
`;

const Subheading: FC<Props> = (props) => {
    const { children } = props;
    return <StyledSubheading>{children}</StyledSubheading>
}

export default Subheading;