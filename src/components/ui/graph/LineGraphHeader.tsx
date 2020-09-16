import React, { useRef, forwardRef, useImperativeHandle, useState } from 'react';
import styled from 'styled-components';
import Stack from '../../layout/stack/Stack';
import Heading from '../../design/heading/Heading';
import Subheading from '../../design/subheading/Subheading';
import { last } from 'lodash';
import { format as formatDate } from 'date-fns';
import numeral from 'numeral';
import Dropdown, { DropdownOption } from '../../design/dropdown/Dropdown';
import { LineChartData } from './LineGraph';
import Box from '../../layout/box/Box';

type LineGraphHeaderProps = {
    data: LineChartData;
    onPeriodChange?: any;
    title?: string;
    onDataKeyChange: any;
    isLoading?: boolean;
    dataFormat: string;
};

const StyledGraphInfo = styled(Stack)`
    align-items: flex-end;
    border-top-right-radius 15px;
    border-top-left-radius: 15px;
    background: #FFFFFF;
`;

const graphOptions = [
    {
        value: 'tvl',
        label: 'Total Value Locked',
    },
    {
        value: 'tsv',
        label: 'Total Swap Volume',
    },
    {
        value: 'tsfv',
        label: 'Total Swap Fee Volume',
    },
    {
        value: 'balancer_usd',
        label: 'Balancer Price (USD)',
    },
    {
        value: 'public_pools',
        label: 'Public Pools',
    },
    {
        value: 'private_pools',
        label: 'Private Pools',
    },
];

const timePeriods = [
    {
        value: 'daily',
        label: 'All Time',
        description: 'Daily data since the inception of the Balancer smart contract.'
    },
    {
        value: 'hourly',
        label: 'Last 24 Hours',
        description: 'Hourly data starting 24 hours from the current minute.'
    },
];

const LineGraphHeader = forwardRef((props: LineGraphHeaderProps, ref) => {
    const { data, onPeriodChange, title, onDataKeyChange, dataFormat } = props;
    const [hoveredValue, setHoveredValue] = useState<string>(numeral(last(data.values) as number).format(dataFormat));
    const [hoveredDate, setHoveredDate] = useState<string>(formatDate(new Date(((last(data.axis) as number) || null) * 1000), 'PP'));
    const axisMouseIndex = useRef<number>();

    useImperativeHandle(ref, () => ({
        onAxisMove: (_data: LineChartData) => (params: any) => {
            if (!axisMouseIndex.current) axisMouseIndex.current = params.dataIndex;
            if (axisMouseIndex.current !== params.dataIndex) {
                axisMouseIndex.current = params.dataIndex;
                data.values[params.dataIndex] && setHoveredValue(numeral(data.values[params.dataIndex] as number).format(dataFormat));
                data.values[params.dataIndex] && setHoveredDate(formatDate(new Date((data.axis[params.dataIndex] as number) * 1000), 'PP'));
            }
        },
    }));

    const handleDataKeyChanged = (option: DropdownOption) => {
        onDataKeyChange(option?.value);
    };

    return (
        <React.Fragment>
            <StyledGraphInfo gap='x-small' orientation='horizontal' paddingX='x-large' paddingTop='x-large'>
                <Stack justify='between' orientation='horizontal' width='100%'>
                    <Stack gap='small'>
                        <Dropdown silent options={graphOptions} onSelected={handleDataKeyChanged} menuWidth='225px' />
                        <Stack gap='x-small'>
                            <Heading level='4'>{hoveredValue}</Heading>
                            <Subheading>{hoveredDate}</Subheading>
                        </Stack>
                    </Stack>
                    <Box>
                        <Dropdown silent options={timePeriods} onSelected={onPeriodChange} menuWidth='225px' />
                    </Box>
                </Stack>
            </StyledGraphInfo>
        </React.Fragment>
    );
});

export default LineGraphHeader;