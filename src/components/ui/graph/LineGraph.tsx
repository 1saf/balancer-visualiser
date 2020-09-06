import React, { FC, useRef, useEffect } from 'react';
import Card from '../../layout/card/Card';
import Box from '../../layout/box/Box';
import styled from 'styled-components';
import echarts from 'echarts';
import { tokens } from '../../../style/Theme';
import LineGraphHeader from './LineGraphHeader';
import { format as formatDate } from 'date-fns';
import numeral from 'numeral';

export type LineChartData = {
    values: unknown[];
    axis: unknown[];
    name: string;
};

type Props = {
    data: LineChartData;
    title: string;
    onPeriodChange: any;
    isLoading?: boolean;
};

const StyledLineGraphContainer = styled(Card)`
    min-height: 400px;
    height: 400px;
    position: relative;
    background: ${props => props.theme.cardBackgroundColor};
`;

const option = (data: LineChartData): echarts.EChartOption => ({
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
        extraCssText: 'box-shadow: 0px 1px 2px rgba(24, 25, 33, 0.1); min-width: 200px; z-index: 1 !important;',
        textStyle: {
            color: tokens.colors.gray700,
        },
        formatter: ([params]: any) => {
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
            fontFamily: 'SegoeUI',
            fontSize: 12,
            color: tokens.colors.gray600,
            fontWeight: 700 as any
        },
    },
    yAxis: {
        axisLabel: {
            formatter: (v: number, i: number) => numeral(v).format('($0a)'),
            fontFamily: 'SegoeUI',
            fontSize: 14,
            color: tokens.colors.gray600,
            fontWeight: 700 as any
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
        right: '8.5%',
        bottom: '50%',
        top: '5%',
    },
});


const LineGraph: FC<Props> = props => {
    const { data, title, onPeriodChange, isLoading } = props;
    const chartContainerRef = useRef();
    const chartRef = useRef<echarts.ECharts>();
    const graphHighlightRef = useRef<any>();

    useEffect(() => {
        chartRef.current && chartRef.current.setOption(option(data));
        console.log('bingo', data);
        chartRef.current && chartRef.current.on('updateAxisPointer', graphHighlightRef.current.onAxisMove(data));
    }, [isLoading]);

    useEffect(() => {
        chartRef.current = echarts.init(chartContainerRef.current);
        chartRef.current.setOption(option(data));
    }, [chartContainerRef]);

    return (
        <StyledLineGraphContainer spanX={12} marginTop='x-large'>
            <LineGraphHeader title={title} data={data} onPeriodChange={onPeriodChange} ref={graphHighlightRef} />
            <Box padding='large' width='100%' height='100%' ref={chartContainerRef} />
        </StyledLineGraphContainer>
    );
};

export default LineGraph;
