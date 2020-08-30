import React, { FC } from 'react';
import Card from '../../layout/card/Card';
import Stack from '../../layout/stack/Stack';
import Subheading from '../../design/subheading/Subheading';
import Heading from '../../design/heading/Heading';

type Props = {
    heading: string;
    subtext?: string;
    icon?: React.ReactElement;
};

const Statistic: FC<Props> = props => {
    const { children, heading } = props;
    return (
        <Card padding='x-large' spanX={4}>
            <Stack gap='small'>
                <Subheading>{heading}</Subheading>
                <Heading level='3'>{children}</Heading>
            </Stack>
        </Card>
    );
};

export default Statistic;
