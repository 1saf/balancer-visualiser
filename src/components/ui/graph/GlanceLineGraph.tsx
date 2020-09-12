import React, { FC, useRef, useEffect } from 'react';
import Card from '../../layout/card/Card';
import Box from '../../layout/box/Box';
import styled from 'styled-components';
import echarts from 'echarts';
import { tokens } from '../../../style/Theme';
import LineGraphHeader from './LineGraphHeader';

export type LineChartData = {
    values: unknown[];
    axis: unknown[];
    name: string;
};

type Props = {
    data: LineChartData;
};

const option = (data: LineChartData): echarts.EChartOption => ({
    title: {
        show: false,
    },
    tooltip: {
        show: false,
    },
    legend: {
        show: false,
    },
    axisPointer: {
        show: false,
    },
    xAxis: {
        show: false,
        type: 'category',
        data: data.axis,
    },
    yAxis: {
        show: false,
    },
    color: [tokens.colors.ultramarine],
    series: [
        {
            name: data.name,
            type: 'line',
            data: data.values,
            smooth: true,
            showSymbol: false,
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1.25, [
                    {
                        offset: 0,
                        color: tokens.colors.blue400,
                    },
                    {
                        offset: 1,
                        color: tokens.colors.white,
                    },
                ]) as any,
            },
            lineStyle: {
                width: 3,
            }
        },
    ],
    grid: {
        left: '-2.5%',
        right: '-2.5%',
        bottom: 0
    }
});

const GlanceLineGraph: FC<Props> = props => {
    const { data } = props;
    const chartContainerRef = useRef();
    const chartRef = useRef<echarts.ECharts>();

    useEffect(() => {
        chartRef.current = echarts.init(chartContainerRef.current);
        chartRef.current.setOption(option(data));
    }, [chartContainerRef]);

    return <Box width='100%' height='150px' ref={chartContainerRef} />;
};

export default GlanceLineGraph;
