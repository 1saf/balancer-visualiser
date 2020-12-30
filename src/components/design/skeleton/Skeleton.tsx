import styled from 'styled-components';
import { tokens } from '../../../style/Theme';
import Stack from '../../layout/stack/Stack';

export const SkeletonText = styled(Stack)`
    animation: skeleton linear 2s infinite;
    border-radius: 200px;
    @keyframes skeleton {
        0% {
            background-color: ${tokens.colors.gray700};
        }
        50% {
            background-color: ${tokens.colors.gray900};
        }
        100% {
            background-color: ${tokens.colors.gray700};
        }
    }
`;
