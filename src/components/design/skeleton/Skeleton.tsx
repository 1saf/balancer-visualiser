import React, { FC } from 'react';
import ContentLoader from 'react-content-loader';
import { tokens } from '../../../style/Theme';
import Card from '../../layout/card/Card';

type Props = {
    viewBox: string;
    width: number;
    height: number;
};

const Skeleton: FC<Props> = props => {
    const { viewBox, children, width, height } = props;
    return (
        <Card width='372px' height='225px'>
            <ContentLoader
                speed={2}
                width={width}
                height={height}
                backgroundColor={tokens.colors.white}
                foregroundColor={tokens.colors.gray200}
                viewBox={viewBox}
            >
                {children}
            </ContentLoader>
        </Card>
    );
};

export default Skeleton;
