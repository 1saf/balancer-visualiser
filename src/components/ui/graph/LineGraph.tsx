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
    min-height: 300px;
    height: 300px;
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
    },
    legend: {
        data: legend,
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
    color: [tokens.colors.ultramarine],
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
                        color: tokens.colors.ultramarine,
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
        show: false,
        left: '4%',
        right: '5%',
        bottom: '7.5%',
        top: '5%',
    },
});

type GraphInfoProps = {
    data: LineChartData;
};

const StyledGraphInfo = styled(Stack)`
    position: absolute;
    top: 1.5rem;
    left: 1.5rem;
`;

// seperate component so the whole chart doesnt re-render
const GraphInfo = forwardRef((props: GraphInfoProps, ref) => {
    const { data } = props;
    const [hoveredValue, setHoveredValue] = useState<string>(numeral(last(data.values) as number).format('($0.00a)'));
    const [hoveredDate, setHoveredDate] = useState<string>(formatDate(parse(last(data.axis) as string, 'yyyy-MM-dd', new Date()), 'PP'));
    const axisMouseIndex = useRef<number>();

    useImperativeHandle(ref, () => ({
        onAxisMove: (params: any) => {
            if (!axisMouseIndex.current) axisMouseIndex.current = params.dataIndex;
            if (axisMouseIndex.current !== params.dataIndex) {
                axisMouseIndex.current = params.dataIndex;
                data.values[params.dataIndex] && setHoveredValue(numeral(data.values[params.dataIndex] as number).format('($0.00a)'));
                data.values[params.dataIndex] && setHoveredDate((formatDate(parse(data.axis[params.dataIndex] as string, 'yyyy-MM-dd', new Date()), 'PP')));
            }
        }
    }));

    return (
        <StyledGraphInfo gap='x-small'>
            <Subheading>Total Value Locked - {hoveredDate}</Subheading>
            <Heading level='4'>{hoveredValue}</Heading>
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
