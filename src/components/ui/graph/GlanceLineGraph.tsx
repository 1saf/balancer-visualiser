import React, { FC, useRef, useEffect } from 'react';
import Card from '../../layout/card/Card';
import Box from '../../layout/box/Box';
import styled from 'styled-components';
import echarts from 'echarts';
import { tokens } from '../../../style/Theme';
import LineGraphHeader from './LineGraphHeader';
import numeral from 'numeral';
import { format as formatDate } from 'date-fns';

export type LineChartData = {
    values: unknown[];
    axis: unknown[];
    name: string;
};

type Props = {
    data: LineChartData;
    colors?: [string, string];
};

function hexToRgb(hex: string) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`: '';
  }

const option = (data: LineChartData, colors?: [string, string]): echarts.EChartOption => ({
    title: {
        show: false,
    },
    tooltip: {
        trigger: 'axis',
        transitionDuration: 1,
        triggerOn: 'mousemove',
        hideDelay: 0,
        borderColor: tokens.colors.gray400,
        borderWidth: 1,
        backgroundColor: '#FFFFFF',
        padding: [7.5, 12.5, 7.5, 12.5],
        extraCssText: 'box-shadow: 0px 0 10px rgba(10, 10, 10, 0.1); z-index: 1 !important; border: none;',
        textStyle: {
            color: tokens.colors.gray700,
        },
        formatter: ([params]: any) => {
            return `<span style='font-weight: 600; text-transform: uppercase'>${formatDate(
                new Date(params?.name * 1000),
                'PP'
            )}</span> <br/>${numeral(params?.value).format('0,0.00')}`;
        },
    },
    legend: {
        show: false,
    },
    axisPointer: {
        snap: true,
    },
    xAxis: {
        show: false,
        type: 'category',
        data: data.axis,
        boundaryGap: false,
        axisLine: {
            show: false,
        },
        axisTick: {
            alignWithLabel: true,
        },
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
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    {
                        offset: 0,
                        color: `rgba(${hexToRgb(colors[0] || tokens.colors.blue400)}, 0.5)`,
                    },
                    {
                        offset: 1,
                        color: `rgba(${hexToRgb(colors[1] || tokens.colors.congo_pink)}, 0.5)`,
                    },
                ]) as any,
            },
            lineStyle: {
                width: 3,
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    {
                        offset: 0,
                        color: colors[0] || tokens.colors.blue400,
                    },
                    {
                        offset: 1,
                        color: colors[1] || tokens.colors.congo_pink,
                    },
                ]) as any,
            }
        },
    ],
    grid: {
        left: 0,
        right: 0,
        bottom: 0
    }
});

const GlanceLineGraph: FC<Props> = props => {
    const { data, colors = ['', ''] } = props;
    const chartContainerRef = useRef();
    const chartRef = useRef<echarts.ECharts>();

    useEffect(() => {
        chartRef.current = echarts.init(chartContainerRef.current);
        chartRef.current.setOption(option(data, colors));
    }, [chartContainerRef]);

    return <Box width='100%' height='150px' ref={chartContainerRef} />;
};

export default GlanceLineGraph;
