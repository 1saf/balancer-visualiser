import React, { FC, useRef, useEffect, ReactElement } from 'react';
import Card from '../../layout/card/Card';
import Box from '../../layout/box/Box';
import styled from 'styled-components';
import echarts from 'echarts';
import { tokens } from '../../../style/Theme';
import { format as formatDate } from 'date-fns';
import numeral from 'numeral';
import 'echarts/lib/component/markLine';
import { last } from 'lodash';
import Skeleton from '../../design/skeleton/Skeleton';

export type LineChartData = {
    series: any;
    axis: unknown[];
};

type Props = {
    data: LineChartData;
    title: string;
    isLoading?: boolean;
    headerRenderer?: (headerElRef: React.Ref<ReactElement>) => void;
    dataFormat?: string;
};

const lineChartConfig = {
    type: 'line',
    smooth: false,
    showSymbol: false,
    areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1.5, [
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
    lineStyle: {
        width: 3,
    },
};

const barChartConfig = {
    type: 'bar',
};

export const getSeries = (type: 'bar' | 'line', name: string, values: unknown[] = [], index?: number, dataFormat?: string) => {
    const commonConfig: any = {
        name,
        data: values,
    };
    if (index) {
        commonConfig.xAxisIndex = index;
        commonConfig.yAxisIndex = index;
    }
    if (type === 'line')
        return {
            ...commonConfig,
            ...lineChartConfig,
            markLine: {
                data: [{ name: 'Latest Day Start Value', yAxis: last(values) || 0 }],
                symbol: 'circle',
                lineStyle: {
                    width: 2,
                    type: 'dotted',
                },
                label: {
                    fontSize: 12,
                    backgroundColor: tokens.colors.ultramarine,
                    color: 'white',
                    padding: 8,
                    formatter: (params: any) => {
                        return numeral(params?.data?.yAxis).format(dataFormat || '0,00');
                    },
                },
            },
        };
    if (type === 'bar') return { ...commonConfig, ...barChartConfig };
};

const StyledLineGraphContainer = styled(Card)`
    min-height: 600px;
    height: 600px;
    position: relative;
`;

const option = (data: LineChartData, dataFormat: string): echarts.EChartOption => ({
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
        formatter: (series: any) => {
            const [data, volume] = series;
            let _data = data;
            let _volume = volume;
            if (data?.seriesType === 'bar') {
                _data = volume;
                _volume = data;
            }
            return `<span style='font-weight: 600; text-transform: uppercase;'>${formatDate(new Date(data?.name * 1000), 'PP p')}</span>
            <br/>${_data?.marker} ${_data?.seriesName}: ${numeral(_data?.value).format(dataFormat)}
            <br/>${_volume?.marker} ${_volume?.seriesName}: ${numeral(_volume?.value[1] * _volume?.value[2]).format(dataFormat)}
            `;
        },
        axisPointer: {
            type: 'shadow',
            label: {
                show: false,
            },
        },
    },
    axisPointer: {
        type: 'shadow',
        link: { xAxisIndex: 'all' } as any,
    },
    visualMap: [
        {
            type: 'piecewise',
            show: false,
            seriesIndex: 1,
            dimension: 2,
            pieces: [
                {
                    value: 1,
                    color: tokens.colors.green400,
                },
                {
                    value: 0,
                    color: tokens.colors.gray400,
                },
                {
                    value: -1,
                    color: tokens.colors.congo_pink,
                },
            ],
        },
    ],
    dataZoom: [
        // allows zoom inside the graph itself
        {
            type: 'inside',
            xAxisIndex: [0, 1],
        },
        // a brushing slider
        {
            show: true,
            xAxisIndex: [0, 1],
            type: 'slider',
            top: '87.5%',
            labelFormatter: (value: any, valueStr: any) => {
                return formatDate(new Date(parseInt(valueStr, 10) * 1000), 'do LLL yy');
            },
            textStyle: {
                color: tokens.colors.gray700,
                fontWeight: '700' as any,
            },
        },
    ],
    xAxis: [
        {
            data: data.axis,
            type: 'category',
            boundaryGap: false,
            axisLine: {
                show: false,
            },
            axisTick: {
                show: false,
            },
            axisLabel: {
                formatter: (v: number, i: number) => formatDate(new Date(v * 1000), 'do LLL yy'),
                fontFamily: 'Inter',
                fontSize: 12,
                color: tokens.colors.gray700,
                fontWeight: '600',
            },
        },
        {
            type: 'category',
            gridIndex: 1,
            data: data.axis,
            scale: true,
            boundaryGap: false,
            axisLine: { onZero: false, lineStyle: { color: tokens.colors.gray500 } },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            min: 'dataMin',
            max: 'dataMax',
        },
    ],
    yAxis: [
        {
            axisLabel: {
                formatter: (v: number, i: number) => numeral(v).format(dataFormat),
                fontFamily: 'Inter',
                fontSize: 14,
                color: tokens.colors.gray800,
            },
            axisLine: {
                show: false,
            },
            axisTick: {
                show: false,
            },
            splitLine: {
                show: false,
                lineStyle: {
                    color: tokens.colors.gray300,
                },
            },
            position: 'right',
        },
        {
            scale: true,
            gridIndex: 1,
            splitNumber: 2,
            axisLabel: { show: false },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false },
        },
    ],
    color: [tokens.colors.ultramarine],
    series: data?.series,
    grid: [
        {
            right: '10%',
            left: '3.5%',
            height: '50%',
        },
        {
            left: '3.5%',
            top: '70%',
            width: '86.5%',
            height: '15%',
        },
    ],
});

const StyledLoadingOverlay = styled(Box)`
    position: absolute;
    top: 150px;
    left: 0;
    width: 100%;
`;

const LineGraph: FC<Props> = props => {
    const { data, isLoading, headerRenderer, dataFormat } = props;
    const chartContainerRef = useRef();
    const chartRef = useRef<echarts.ECharts>();
    const graphHighlightRef = useRef<any>();

    useEffect(() => {
        !isLoading && chartRef.current && data?.series?.data?.length && chartRef.current.clear();
        chartRef.current && chartRef.current.setOption(option(data, dataFormat), true, true);
        chartRef.current && chartRef.current.off('updateAxisPointer');
        chartRef.current && chartRef.current.on('updateAxisPointer', graphHighlightRef?.current?.onAxisMove(data));
    }, [isLoading, data?.series?.data?.length, graphHighlightRef?.current]);

    useEffect(() => {
        chartRef.current = echarts.init(chartContainerRef.current);
        chartRef.current.setOption(option(data, dataFormat));
    }, [chartContainerRef]);

    return (
        <StyledLineGraphContainer spanX={12}>
            {headerRenderer && headerRenderer(graphHighlightRef)}
            <Box paddingX='large' width='100%' height='500px' ref={chartContainerRef} />
            {isLoading && (
                <StyledLoadingOverlay>
                    <Skeleton width='100%' height={300} viewBox='0 0 100% 300'>
                        <rect x='0' y='0' rx='0' ry='0' width='100%' height='300' />
                    </Skeleton>
                </StyledLoadingOverlay>
            )}
        </StyledLineGraphContainer>
    );
};

export default LineGraph;
