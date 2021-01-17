import styled from 'styled-components';
import { tokens } from '../../../style/Theme';
import Box from '../../layout/box/Box';

export const StyledTokenIcon = styled(Box)`
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 5;
    box-sizing: border-box;
    overflow: hidden;
    border-radius: 12px;
    background: radial-gradient(circle at center, white 61%, transparent 66%);

    & > img {
        width: 24px;
        height: 24px;
        overflow: hidden;

        &:before {
            content: '❓';
            display: flex;
            justify-content: center;
            align-items: center;
            position: absolute;
            height: 24px;
            width: 24px;
            background: ${tokens.colors.white};
            border-radius: 12px;
        }
    }
`;

export const TokenIconGroup = styled(Box)`
    display: flex;
    & > *:not(:first-child) {
        margin-left: -8px !important;
    }
`;
