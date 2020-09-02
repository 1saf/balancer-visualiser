import React, { FC } from 'react';
import Card from '../../layout/card/Card';
import { ResponsiveLine } from '@nivo/line';
import styled from 'styled-components';

type Props = {};

const data = [
    {
        id: 'japan',
        color: 'hsl(293, 70%, 50%)',
        data: [
            {
                x: 'plane',
                y: 7,
            },
            {
                x: 'helicopter',
                y: 278,
            },
            {
                x: 'boat',
                y: 282,
            },
            {
                x: 'train',
                y: 234,
            },
            {
                x: 'subway',
                y: 237,
            },
            {
                x: 'bus',
                y: 178,
            },
            {
                x: 'car',
                y: 278,
            },
            {
                x: 'moto',
                y: 208,
            },
            {
                x: 'bicycle',
                y: 231,
            },
            {
                x: 'horse',
                y: 34,
            },
            {
                x: 'skateboard',
                y: 225,
            },
            {
                x: 'others',
                y: 124,
            },
        ],
    },
    {
        id: 'france',
        color: 'hsl(229, 70%, 50%)',
        data: [
            {
                x: 'plane',
                y: 174,
            },
            {
                x: 'helicopter',
                y: 39,
            },
            {
                x: 'boat',
                y: 129,
            },
            {
                x: 'train',
                y: 2,
            },
            {
                x: 'subway',
                y: 88,
            },
            {
                x: 'bus',
                y: 242,
            },
            {
                x: 'car',
                y: 81,
            },
            {
                x: 'moto',
                y: 14,
            },
            {
                x: 'bicycle',
                y: 10,
            },
            {
                x: 'horse',
                y: 58,
            },
            {
                x: 'skateboard',
                y: 224,
            },
            {
                x: 'others',
                y: 113,
            },
        ],
    },
    {
        id: 'us',
        color: 'hsl(234, 70%, 50%)',
        data: [
            {
                x: 'plane',
                y: 273,
            },
            {
                x: 'helicopter',
                y: 266,
            },
            {
                x: 'boat',
                y: 281,
            },
            {
                x: 'train',
                y: 161,
            },
            {
                x: 'subway',
                y: 206,
            },
            {
                x: 'bus',
                y: 273,
            },
            {
                x: 'car',
                y: 247,
            },
            {
                x: 'moto',
                y: 164,
            },
            {
                x: 'bicycle',
                y: 195,
            },
            {
                x: 'horse',
                y: 225,
            },
            {
                x: 'skateboard',
                y: 173,
            },
            {
                x: 'others',
                y: 10,
            },
        ],
    },
    {
        id: 'germany',
        color: 'hsl(138, 70%, 50%)',
        data: [
            {
                x: 'plane',
                y: 116,
            },
            {
                x: 'helicopter',
                y: 119,
            },
            {
                x: 'boat',
                y: 66,
            },
            {
                x: 'train',
                y: 233,
            },
            {
                x: 'subway',
                y: 114,
            },
            {
                x: 'bus',
                y: 119,
            },
            {
                x: 'car',
                y: 284,
            },
            {
                x: 'moto',
                y: 284,
            },
            {
                x: 'bicycle',
                y: 252,
            },
            {
                x: 'horse',
                y: 60,
            },
            {
                x: 'skateboard',
                y: 289,
            },
            {
                x: 'others',
                y: 198,
            },
        ],
    },
    {
        id: 'norway',
        color: 'hsl(303, 70%, 50%)',
        data: [
            {
                x: 'plane',
                y: 133,
            },
            {
                x: 'helicopter',
                y: 91,
            },
            {
                x: 'boat',
                y: 142,
            },
            {
                x: 'train',
                y: 197,
            },
            {
                x: 'subway',
                y: 226,
            },
            {
                x: 'bus',
                y: 132,
            },
            {
                x: 'car',
                y: 54,
            },
            {
                x: 'moto',
                y: 300,
            },
            {
                x: 'bicycle',
                y: 116,
            },
            {
                x: 'horse',
                y: 127,
            },
            {
                x: 'skateboard',
                y: 43,
            },
            {
                x: 'others',
                y: 58,
            },
        ],
    },
];

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
const MyResponsiveLine = ({ data /* see data tab */ }: any) => (
    <ResponsiveLine
        data={data}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: true, reverse: false }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
            orient: 'bottom',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'transportation',
            legendOffset: 36,
            legendPosition: 'middle',
        }}
        axisLeft={{
            orient: 'left',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'count',
            legendOffset: -40,
            legendPosition: 'middle',
        }}
        colors={{ scheme: 'nivo' }}
        pointSize={10}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabel='y'
        pointLabelYOffset={-12}
        useMesh={true}
        legends={[
            {
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: 'circle',
                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemBackground: 'rgba(0, 0, 0, .03)',
                            itemOpacity: 1,
                        },
                    },
                ],
            },
        ]}
    />
);
const StyledLineGraphContainer = styled(Card)`
    min-height: 400px;
    height: 400px;
`;

const LineGraph: FC<Props> = props => {
    const {} = props;
    return (
        <StyledLineGraphContainer spanX={12} padding='large' marginTop='x-large'>
            <MyResponsiveLine data={data} />
        </StyledLineGraphContainer>
    );
};

export default LineGraph;
