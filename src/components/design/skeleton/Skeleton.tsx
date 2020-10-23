import React, { FC } from 'react';
import ContentLoader from 'react-content-loader';
import { tokens } from '../../../style/Theme';
import Card from '../../layout/card/Card';

type Props = {
    viewBox: string;
    width: number | string;
    height: number | string;
};

const Skeleton: FC<Props> = props => {
    const { viewBox, children, width, height } = props;
    return (
        <ContentLoader
            speed={2}
            width={width}
            height={height}
            backgroundColor={tokens.colors.white}
            foregroundColor={tokens.colors.blue100}
            viewBox={viewBox}
        >
            {children}
        </ContentLoader>
    );
};

export default Skeleton;
