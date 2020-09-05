import React, { FC, useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import Card from '../../layout/card/Card';
import Box from '../../layout/box/Box';
import styled, { css } from 'styled-components';
import echarts from 'echarts';
import { tokens } from '../../../style/Theme';
import Stack from '../../layout/stack/Stack';
import Heading from '../../design/heading/Heading';
import Subheading from '../../design/subheading/Subheading';
import { tail, last } from 'lodash';
import { format as formatDate, parse } from 'date-fns';
import numeral from 'numeral';
import ActionButton from '../../design/action_button/ActionButton';

type LineChartData = {
    values: unknown[];
    axis: unknown[];
    name: string;
};

type Props = {
    data: LineChartData;
    title: string;
    legend: string[];
};

const StyledLineGraphContainer = styled(Card)`
    min-height: 275px;
    height: 275px;
    position: relative;
`;

const option = (data: LineChartData, title: string, legend: string[]): echarts.EChartOption => ({
    title: {
        show: false,
    },
    tooltip: {
        trigger: 'axis',
        transitionDuration: 1,
        alwaysShowContent: true,
        triggerOn: 'mousemove',
        hideDelay: 0,
        borderColor: tokens.colors.gray400,
        borderWidth: 1,
        backgroundColor: '#FFFFFF',
        padding: [7.5, 12.5, 7.5, 12.5],
        extraCssText: 'box-shadow: 0px 1px 2px rgba(24, 25, 33, 0.1); min-width: 200px',
        textStyle: {
            color: tokens.colors.gray700,
        },
        formatter: ([params]: any) => {
            console.log('par', params);
            return `<span style='font-weight: 600; text-transform: uppercase;'>${formatDate(
                new Date(params?.name * 1000),
                'PP'
            )}</span> <br/> ${params?.marker} ${params?.seriesName}: ${numeral(params?.value).format('$0,0.00')}`;
        },
    },
    legend: {
        show: false,
    },
    axisPointer: {
        snap: true,
    },
    xAxis: {
        data: data.axis,
        type: 'category',
        boundaryGap: false,
        axisLine: {
            show: false,
        },
        axisTick: {
            alignWithLabel: true,
        },
        axisLabel: {
            formatter: (v: number, i: number) => formatDate(new Date(v * 1000), 'do LLL yy'),
        },
    },
    yAxis: {
        axisLabel: {
            formatter: (v: number, i: number) => numeral(v).format('($0a)'),
        },
        axisLine: {
            show: false,
        },
        splitLine: {
            show: false,
        },
        position: 'right',
    },
    color: [tokens.colors.congo_pink],
    series: [
        {
            name: data.name,
            type: 'line',
            data: data.values,
            smooth: false,
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1.25, [
                    {
                        offset: 0,
                        color: tokens.colors.congo_pink,
                    },
                    {
                        offset: 1,
                        color: tokens.colors.white,
                    },
                ]) as any,
            },
        },
    ],
    grid: {
        left: '3.75%',
        right: '5%',
        bottom: '25%',
        top: '7.5%',
    },
});

type GraphInfoProps = {
    data: LineChartData;
};

const StyledGraphInfo = styled(Stack)`
    border-bottom: 1px solid ${props => props.theme.borderColor};
    justify-content: space-between;
    align-items: center;
`;

const historicalPeriods = [{
    period: '24',
    type: 'hour',
    label: '24H',
}, {
    period: '7',
    type: 'days',
    label: '7D',
}, {
    period: '14',
    type: 'days',
    label: '14D'
}, {
    period: '30',
    type: 'days',
    label: '30D',
}, {
    period: '90',
    type: 'days',
    label: '90D'
}, {
    period: '1',
    type: 'year',
    label: '1Y'
}]

// seperate component so the whole chart doesnt re-render
const GraphInfo = forwardRef((props: GraphInfoProps, ref) => {
    const { data } = props;
    const [hoveredValue, setHoveredValue] = useState<string>(numeral(last(data.values) as number).format('($0.00a)'));
    const [hoveredDate, setHoveredDate] = useState<string>(formatDate(new Date((last(data.axis) as number) * 1000), 'PP'));
    const axisMouseIndex = useRef<number>();

    useImperativeHandle(ref, () => ({
        onAxisMove: (params: any) => {
            if (!axisMouseIndex.current) axisMouseIndex.current = params.dataIndex;
            if (axisMouseIndex.current !== params.dataIndex) {
                axisMouseIndex.current = params.dataIndex;
                data.values[params.dataIndex] && setHoveredValue(numeral(data.values[params.dataIndex] as number).format('($0.00a)'));
                data.values[params.dataIndex] && setHoveredDate(formatDate(new Date((data.axis[params.dataIndex] as number) * 1000), 'PP'));
            }
        },
    }));

    return (
        <StyledGraphInfo gap='x-small' orientation='horizontal' paddingBottom='medium'>
            <Stack gap='x-small'>
                <Subheading>Total Value Locked - {hoveredDate}</Subheading>
                <Heading level='4'>{hoveredValue}</Heading>
            </Stack>
            <Stack orientation='horizontal' gap='x-small'>
                {
                    historicalPeriods.map(period => <ActionButton>{period.label}</ActionButton>)
                }
            </Stack>
        </StyledGraphInfo>
    );
});

const LineGraph: FC<Props> = props => {
    const { data, title, legend } = props;
    const chartContainerRef = useRef();
    const chartRef = useRef<echarts.ECharts>();
    const graphHighlightRef = useRef<any>();

    useEffect(() => {
        chartRef.current = echarts.init(chartContainerRef.current);
        chartRef.current.setOption(option(data, title, legend));

        chartRef.current.on('updateAxisPointer', graphHighlightRef.current.onAxisMove);
    }, [chartContainerRef]);

    return (
        <StyledLineGraphContainer spanX={12} padding='large' marginTop='x-large'>
            <GraphInfo data={data} ref={graphHighlightRef} />
            <div style={{ width: '100%', height: '100%' }} ref={chartContainerRef} />
        </StyledLineGraphContainer>
    );
};

export default LineGraph;
