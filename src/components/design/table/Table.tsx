import { AnimatePresence, motion } from 'framer-motion';
import React, { FC, MouseEvent, useCallback, useEffect, useImperativeHandle } from 'react';
import { useTable, useSortBy, useAsyncDebounce, useBlockLayout, useFlexLayout } from 'react-table';
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
    isLoading?: boolean;
    isFetchingMore?: boolean;
    skeletonHeight?: number;
};

const StyledTable = styled.table`
    width: 100%;
`;

const StyledHead = styled.thead`
    width: 100%;
`;

const StyledBody = styled(motion.tbody)`
    width: 100%;
`;

const StyledCellRow = styled(motion.tr)`
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

const StyledInlineSearch = styled.input`
    border: none;
    color: ${tokens.colors.ultramarine};
    font-weight: 600;
    outline: none;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;

    ::placeholder {
        color: ${tokens.colors.blue400};
    }

    &:hover {
        background-color: ${tokens.colors.gray200};
    }
`;

const StyledSkeletonCell = styled.td<{ skeletonHeight?: number }>`
    background-color: #edf2f7;
    animation: skeleton linear 2s infinite;
    -webkit-animation: skeleton linear 2s infinite;
    padding: 1.25rem 1rem;
    min-height: ${props => props.skeletonHeight}px;
    height: ${props => props.skeletonHeight}px;
    @keyframes skeleton {
        0% {
            background-color: ${tokens.colors.blue100};
        }
        50% {
            background-color: #fff;
        }
        100% {
            background-color: ${tokens.colors.blue100};
        }
    }

    @-webkit-keyframes skeleton {
        0% {
            background-color: ${tokens.colors.blue100};
        }
        50% {
            background-color: #fff;
        }
        100% {
            background-color: ${tokens.colors.blue100};
        }
    }
`;

const Table: FC<Props> = props => {
    const { columns, data, setTableState, isLoading, skeletonHeight, isFetchingMore } = props;
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, state } = useTable(
        { columns: columns as any, data, autoResetSortBy: false } as any,
        useSortBy,
        useFlexLayout
    );
    const sortBy = (state as any)?.sortBy[0];

    useEffect(() => {
        setTableState({ sortBy });
    }, [sortBy?.id, sortBy?.desc]);

    const searchOnClick = useCallback((event: MouseEvent) => {
        event.stopPropagation();
    }, []);

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
                                        const isSearchable = (column as any)?.isSearchable;
                                        const onSearch = (column as any)?.onSearch;
                                        return (
                                            <StyledHeaderCell
                                                {...column.getHeaderProps((column as any).getSortByToggleProps())}
                                                isNumerical={(column as any).isNumerical}
                                            >
                                                <Stack gap='small'>
                                                    <Stack
                                                        orientation='horizontal'
                                                        width='100%'
                                                        justify={justify}
                                                        gap='base'
                                                        align='center'
                                                    >
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
                                                    {isSearchable && (
                                                        <StyledInlineSearch
                                                            name={column?.id}
                                                            onClick={searchOnClick}
                                                            placeholder='Search...'
                                                            onChange={onSearch}
                                                        />
                                                    )}
                                                </Stack>
                                            </StyledHeaderCell>
                                        );
                                    })
                                }
                            </tr>
                        ))
                    }
                </StyledHead>
                {isLoading && (
                    <StyledBody>
                        {[...Array(20)].map((_, i) => (
                            <StyledCellRow>
                                <StyledSkeletonCell key={`tableskeleton-${i}`} skeletonHeight={skeletonHeight} />
                            </StyledCellRow>
                        ))}
                    </StyledBody>
                )}

                {!isLoading && rows.length && (
                    // <AnimatePresence>
                    <StyledBody {...getTableBodyProps()}>
                        {
                            // Loop over the table rows
                            rows.map((row, rowNumber) => {
                                // Prepare the row for display
                                prepareRow(row);
                                return (
                                    // Apply the row props
                                    <StyledCellRow
                                        {...row.getRowProps()}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1, transition: { delay: 0.01 * rowNumber } }}
                                    >
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
                    // </AnimatePresence>
                )}
            </StyledTable>
        </Box>
    );
};

export default Table;
