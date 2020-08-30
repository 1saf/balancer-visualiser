import React, { FC } from 'react';
import Box from '../../layout/box/Box';
import Pebbles from './pebbles.svg';
import styled from 'styled-components';

type Props = {};

const StyledPebbles = styled(Pebbles)`
    height: 40px;
    width: 40px;
`;

const Header: FC<Props> = props => {
    const {} = props;
    return <Box>
        <StyledPebbles />
    </Box>;
};

export default Header;
