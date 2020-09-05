import React, { FC } from 'react';
import { Spacing, ResponsiveProp, getMediaQuery, SpacingRemConfig } from '../layout.t';
import styled, { css } from 'styled-components';
import Box, { BoxProps } from '../box/Box';

type Orientation = 'horizontal' | 'vertical';

type Props = {
    orientation?: Orientation;
    gap?: ResponsiveProp<Spacing>;
    className?: string;
};


const resolveStackCss = (props: Props) => {
    const { orientation, gap } = props;
    const marginType = orientation === 'horizontal' ? 'right' : 'bottom';
    const marginProperty = `margin-${marginType}`;
    const flexDirection = orientation === 'horizontal' ? 'row' : 'column';

    return css`
    display: flex;
    flex-direction: ${flexDirection};
    & > * {
        &:not(:last-child) {
            ${!Array.isArray(gap) && `${marginProperty}: ${SpacingRemConfig[gap]}rem;`}
            ${Array.isArray(gap) && `${marginProperty}: ${SpacingRemConfig[gap[0]]}rem;`}
            ${getMediaQuery('tablet')} {
                ${Array.isArray(gap) && `${marginProperty}: ${SpacingRemConfig[gap[1]]}rem;`}
            }
            ${getMediaQuery('landscape')} {
                ${Array.isArray(gap) && `${marginProperty}: ${SpacingRemConfig[gap[2]]}rem;`}
            }
            ${getMediaQuery('smallDesktop')} {
                ${Array.isArray(gap) && `${marginProperty}: ${SpacingRemConfig[gap[3]]}rem;`}
            }
            ${getMediaQuery('largeDesktop')} {
                ${Array.isArray(gap) && `${marginProperty}: ${SpacingRemConfig[gap[4]]}rem;`}
            }
        }
    }
    `;
};

const StyledStack = styled(Box)<Props>`
    ${resolveStackCss}
`;

const Stack: FC<Props & BoxProps> = props => {
    const { orientation = 'vertical', children, gap = 'base', className } = props;
    return (
        <StyledStack {...props} orientation={orientation} gap={gap} className={className}>
            {children}
        </StyledStack>
    );
};

export default Stack;
