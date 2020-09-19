import React, { FC, useRef, useEffect, ReactElement } from 'react';
import Card from '../../layout/card/Card';
import Box from '../../layout/box/Box';
import styled from 'styled-components';
import echarts from 'echarts';
import { tokens } from '../../../style/Theme';
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
    isLoading?: boolean;
    headerRenderer?: (headerElRef: React.Ref<ReactElement>) => void;
    dataFormat?: string;
};

const StyledBarGraphContainer = styled(Card)`
    min-height: 450px;
    height: 450px;
    position: relative;
    border-radius: 15px;
    background: ${props => props.theme.cardBackgroundColor};
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
        extraCssText: 'box-shadow: 0px 1px 2px rgba(24, 25, 33, 0.1); min-width: 200px; z-index: 1 !important;',
        textStyle: {
            color: tokens.colors.gray700,
        },
        formatter: ([params]: any) => {
            return `<span style='font-weight: 600; text-transform: uppercase;'>${formatDate(
                new Date(params?.name * 1000),
                'PP p'
            )}</span> <br/> ${params?.marker} ${params?.seriesName}: ${numeral(params?.value).format(dataFormat)}`;
        },
    },
    legend: {
        show: false,
    },
    axisPointer: {
        snap: true,
    },
    dataZoom: [{
        type: 'slider',
        xAxisIndex: 0,
        labelFormatter: (value: any, valueStr: any) => {
            return formatDate(new Date(parseInt(valueStr, 10) * 1000), 'do LLL yy')
        },
        textStyle: {
            color: tokens.colors.gray700,
            fontWeight: '700' as any,
        }
    },{
        type: 'inside',
        xAxisIndex: 0,
    }],
    xAxis: {
        data: data.axis,
        type: 'category',
        boundaryGap: false,
        axisLine: {
            show: false,
        },
        axisTick: {
            alignWithLabel: true,
            show: false
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
            formatter: (v: number, i: number) => numeral(v).format(dataFormat),
            fontFamily: 'SegoeUI',
            fontSize: 14,
            color: tokens.colors.gray600,
            fontWeight: 700 as any
        },
        axisLine: {
            show: false,
        },
        axisTick: {
            show: false,
        },
        splitLine: {
            lineStyle: {
                color: tokens.colors.gray300
            }
        },
        position: 'right',
    },
    color: [tokens.colors.ultramarine],
    series: [
        {
            name: data.name,
            type: 'bar',
            data: data.values,
        },
    ],
    grid: {
        right: '12.5%',
        top: '5%',
        left: '7.5%'
    },
});

const StyledLoadingOverlay = styled(Box)`
    position: absolute;
    top: 150px;
    left: 0;
    height: 300px;
    width: 100%;
    background-color: #F3F3F5;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const BarGraph: FC<Props> = props => {
    const { data, isLoading, headerRenderer, dataFormat } = props;
    const chartContainerRef = useRef();
    const chartRef = useRef<echarts.ECharts>();
    const graphHighlightRef = useRef<any>();

    useEffect(() => {
        chartRef.current = echarts.init(chartContainerRef.current);
        chartRef.current.setOption(option(data, dataFormat));
    }, [chartContainerRef]);

    return (
        <StyledBarGraphContainer spanX={12}>
            <Box padding='large' width='100%' height='300px' ref={chartContainerRef} />
            {
                isLoading &&
                <StyledLoadingOverlay>Loading data from the subgrah...(This loading indicator is a WIP), non-hourly data is refetched every 5 minutes</StyledLoadingOverlay>
            }
        </StyledBarGraphContainer>
    );
};

export default BarGraph;
