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
import Tooltip from '../../design/tooltip/Tooltip';
import { Option, Period } from '../../../api/datatypes';
import ButtonGroup from '../../design/button_group/ButtonGroup';

type LineGraphHeaderProps = {
    data: LineChartData;
    onPeriodChange?: any;
    title?: string;
    onDataKeyChange: any;
    isLoading?: boolean;
    dataFormat: string;
    dataOptions?: Option[];
    periodOptions: Option[];
};

const StyledGraphInfo = styled(Stack)`
    align-items: flex-end;
    border-top-right-radius 15px;
    border-top-left-radius: 15px;
`;

const LineGraphHeader = forwardRef((props: LineGraphHeaderProps, ref) => {
    const { data, onPeriodChange, onDataKeyChange, dataFormat, dataOptions = [], periodOptions } = props;
    const [hoveredValue, setHoveredValue] = useState<string>('$ - . -');
    const [hoveredDate, setHoveredDate] = useState<string>('-');
    const [selectedPeriod, setSelectedPeriod] = useState(periodOptions[1]);
    const axisMouseIndex = useRef<number>();

    useImperativeHandle(ref, () => ({
        onAxisMove: (_data: LineChartData) => (params: any) => {
            if (!axisMouseIndex.current) axisMouseIndex.current = params.dataIndex;
            if (axisMouseIndex.current !== params.dataIndex) {
                axisMouseIndex.current = params.dataIndex;
                data?.series[0]?.data[params.dataIndex] && setHoveredValue(numeral(data?.series[0]?.data[params.dataIndex] as number).format(dataFormat));
                data?.series[0]?.data[params.dataIndex] && setHoveredDate(formatDate(new Date((data.axis[params.dataIndex] as number) * 1000), 'PP'));
            }
        },
    }));

    const _onDataKeyChange = (option: DropdownOption) => {
        setHoveredValue('$ - . -');
        setHoveredDate('-')
        onDataKeyChange(option);
    }

    const handlePeriodChange = (change: { value: string, label: string }) => {
        onPeriodChange(change.value);
        setSelectedPeriod(change);
    }

    return (
        <React.Fragment>
            <StyledGraphInfo gap='x-small' orientation='horizontal' paddingX='x-large' paddingTop='large'>
                <Stack justify='between' orientation='horizontal' width='100%'>
                    <Stack>
                        <Dropdown silent options={dataOptions} onSelected={_onDataKeyChange} menuWidth='225px' />
                        <Stack gap='x-small' paddingLeft='x-small'>
                            <Heading level='4'>{hoveredValue}</Heading>
                            <Subheading>{hoveredDate}</Subheading>
                        </Stack>
                    </Stack>
                    <Box>
                        {
                            onPeriodChange &&
                            <ButtonGroup weight='secondary' size='small' value={`${selectedPeriod.value}-${selectedPeriod.label}`} options={periodOptions} setValue={handlePeriodChange} />
                        }
                    </Box>
                </Stack>
            </StyledGraphInfo>
        </React.Fragment>
    );
});

export default LineGraphHeader;
