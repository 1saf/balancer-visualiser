import React, { FC, useEffect, useImperativeHandle } from 'react';
import { useTable, useSortBy, useAsyncDebounce } from 'react-table';
import styled from 'styled-components';
import { tokens } from '../../../style/Theme';
import Box from '../../layout/box/Box';
import Card from '../../layout/card/Card';

import Stack from '../../layout/stack/Stack';

export type ColumnDefinition = {
    Header: string;
    accessor: ((row: any) => unknown) | string;
    isNumerical?: boolean;
};

type Props = {
    columns: ColumnDefinition[];
    data: Record<string, unknown>[];
    setTableState: any;
};

const StyledTable = styled.table`
    width: 100%;
`;

const StyledHead = styled.thead`
    width: 100%;
`;

const StyledBody = styled.tbody`
    width: 100%;
`;

const StyledCellRow = styled.tr`
    border-top: 1px ${tokens.colors.gray400} solid;
`;

const StyledHeaderCell = styled.th<{ isNumerical?: boolean }>`
    font-weight: 500;
    color: ${tokens.colors.gray800};
    padding: 1.25rem 1rem;
    text-align: ${props => (props.isNumerical ? 'right' : 'left')};
`;

const StyledCell = styled.td<{ isNumerical?: boolean }>`
    font-weight: 500;
    color: ${tokens.colors.gray800};
    padding: 1.25rem 1rem;
    font-size: 0.85rem;
    text-align: ${props => (props.isNumerical ? 'right' : 'left')};
    vertical-align: middle;
`;

const StyledSortIndicator = styled(Box)<{ active?: boolean }>`
    line-height: 0.85;
    font-size: 0.75rem;
    color: ${props => (props.active ? tokens.colors.ultramarine : tokens.colors.gray400)};
`;

const Table: FC<Props> = props => {
    const { columns, data, setTableState } = props;
    const skipPageResetRef = React.useRef();

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, state } = useTable(
        { columns: columns as any, data, autoResetSortBy: false } as any,
        useSortBy
    );
    const sortBy = (state as any)?.sortBy[0];

    useEffect(() => {
        setTableState({ sortBy });
    }, [sortBy?.id, sortBy?.desc]);

    return (
        <Box padding='small'>
            <StyledTable {...getTableProps()}>
                <StyledHead>
                    {
                        // Loop over the header rows
                        headerGroups.map(headerGroup => (
                            // Apply the header row props
                            <tr {...headerGroup.getHeaderGroupProps()}>
                                {
                                    // Loop over the headers in each row
                                    headerGroup.headers.map(column => {
                                        // Apply the header cell props
                                        const justify = (column as any)?.isNumerical ? 'end' : 'start';
                                        return (
                                            <StyledHeaderCell
                                                {...column.getHeaderProps((column as any).getSortByToggleProps())}
                                                isNumerical={(column as any).isNumerical}
                                            >
                                                <Stack orientation='horizontal' width='100%' justify={justify} gap='base' align='center'>
                                                    {
                                                        // Render the header
                                                        column.render('Header')
                                                    }
                                                    <Stack>
                                                        <StyledSortIndicator
                                                            active={(column as any).isSorted && !(column as any).isSortedDesc}
                                                        >
                                                            &nbsp;▲
                                                            {/* { ? '▼' : '▲') : ''} */}
                                                        </StyledSortIndicator>
                                                        <StyledSortIndicator
                                                            active={(column as any).isSorted && (column as any).isSortedDesc}
                                                        >
                                                            &nbsp;▼
                                                            {/* {(column as any).isSorted ? ((column as any).isSortedDesc ? '▼' : '▲') : ''} */}
                                                        </StyledSortIndicator>
                                                    </Stack>
                                                </Stack>
                                            </StyledHeaderCell>
                                        );
                                    })
                                }
                            </tr>
                        ))
                    }
                </StyledHead>
                <StyledBody {...getTableBodyProps()}>
                    {
                        // Loop over the table rows
                        rows.map(row => {
                            // Prepare the row for display
                            prepareRow(row);
                            return (
                                // Apply the row props
                                <StyledCellRow {...row.getRowProps()}>
                                    {
                                        // Loop over the rows cells
                                        row.cells.map(cell => {
                                            // Apply the cell props
                                            return (
                                                <StyledCell {...cell.getCellProps()} isNumerical={(cell?.column as any).isNumerical}>
                                                    {
                                                        // Render the cell contents
                                                        cell.render('Cell')
                                                    }
                                                </StyledCell>
                                            );
                                        })
                                    }
                                </StyledCellRow>
                            );
                        })
                    }
                </StyledBody>
            </StyledTable>
        </Box>
    );
};

export default Table;
