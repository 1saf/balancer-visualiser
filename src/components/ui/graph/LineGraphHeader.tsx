import React, { useRef, forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import styled from 'styled-components';
import Stack from '../../layout/stack/Stack';
import Heading from '../../design/heading/Heading';
import Subheading from '../../design/subheading/Subheading';
import { last } from 'lodash';
import { format as formatDate } from 'date-fns';
import numeral, { value } from 'numeral';
import Dropdown, { DropdownOption } from '../../design/dropdown/Dropdown';
import { UisChart } from '@iconscout/react-unicons-solid';
import { LineChartData } from './LineGraph';

type LineGraphHeaderProps = {
    data: LineChartData;
    onPeriodChange: any;
    title?: string;
};

const StyledGraphInfo = styled(Stack)`
    border-bottom: 1px solid ${props => props.theme.borderColor};
    align-items: flex-end;
    border-top-right-radius 15px;
    border-top-left-radius: 15px;
    background: #FFFFFF;
`;

const timePeriods = [
    {
        value: 'daily',
        label: 'Daily',
    },
    {
        value: 'hourly',
        label: '24 hours',
    },
];

const LineGraphHeader = forwardRef((props: LineGraphHeaderProps, ref) => {
    const { data, onPeriodChange, title } = props;
    const [hoveredValue, setHoveredValue] = useState<string>(numeral(last(data.values) as number).format('($0.00a)'));
    const [hoveredDate, setHoveredDate] = useState<string>(formatDate(new Date((last(data.axis) as number) * 1000), 'PP'));
    const axisMouseIndex = useRef<number>();

    useImperativeHandle(ref, () => ({
        onAxisMove: (_data: LineChartData) => (params: any) => {
            if (!axisMouseIndex.current) axisMouseIndex.current = params.dataIndex;
            if (axisMouseIndex.current !== params.dataIndex) {
                axisMouseIndex.current = params.dataIndex;
                data.values[params.dataIndex] && setHoveredValue(numeral(data.values[params.dataIndex] as number).format('($0.00a)'));
                data.values[params.dataIndex] && setHoveredDate(formatDate(new Date((data.axis[params.dataIndex] as number) * 1000), 'PP'));
            }
        },
    }));

    const onTimePeriodChange = (option: DropdownOption & { type: string }) => {
        onPeriodChange && onPeriodChange(option);
    }

    return (
        <React.Fragment>
            <StyledGraphInfo gap='x-small' orientation='horizontal' paddingX='large' paddingY='base'>
                <Stack gap='small'>
                    <Heading level='6'>{title}</Heading>
                    <Stack gap='x-small'>
                        <Heading level='4'>{hoveredValue}</Heading>
                        <Subheading>{hoveredDate}</Subheading>
                    </Stack>
                </Stack>
            </StyledGraphInfo>
            <StyledGraphInfo gap='x-small' orientation='horizontal' paddingX='large' paddingY='medium'>
                <Stack orientation='horizontal' gap='x-small'>
                    <Dropdown onSelected={onTimePeriodChange} options={timePeriods} icon={<UisChart size='16' />} />
                </Stack>
            </StyledGraphInfo>
        </React.Fragment>
    );
});

export default LineGraphHeader;