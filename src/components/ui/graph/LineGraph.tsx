import React, { FC, useRef, useEffect } from 'react';
import Card from '../../layout/card/Card';
import Box from '../../layout/box/Box';
import styled, { css } from 'styled-components';
import echarts from 'echarts';
import numeral from 'numeral';
import { tokens } from '../../../style/Theme';

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
    min-height: 400px;
    height: 400px;
`;

const option = (data: LineChartData, title: string, legend: string[]) => ({
    title: {
        text: title,
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
    grid: {
        show: false,
    },
    color: [tokens.colors.ultramarine],
    series: [
        {
            name: data.name,
            type: 'line',
            data: data.values,
            smooth: true,
            areaStyle: {},
        },
    ],
});

const LineGraph: FC<Props> = props => {
    const { data, title, legend } = props;
    const chartContainerRef = useRef();
    const chartRef = useRef<echarts.ECharts>();

    useEffect(() => {
        chartRef.current = echarts.init(chartContainerRef.current);
        chartRef.current.setOption(option(data, title, legend));
    }, [chartContainerRef]);

    return (
        <StyledLineGraphContainer spanX={12} padding='large' marginTop='x-large'>
            <div style={{ width: '100%', height: '100%' }} ref={chartContainerRef} />
        </StyledLineGraphContainer>
    );
};

export default LineGraph;
