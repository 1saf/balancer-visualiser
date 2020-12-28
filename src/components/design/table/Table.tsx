import { AnimatePresence, motion } from 'framer-motion';
import React, { FC, MouseEvent, useCallback, useEffect, useImperativeHandle } from 'react';
import { useTable, useSortBy, useAsyncDebounce, useBlockLayout, useFlexLayout } from 'react-table';
import { useSticky } from 'react-table-sticky';
import styled from 'styled-components';
import { tokens } from '../../../style/Theme';
import Box from '../../layout/box/Box';
import QuestionMark from '../../../assets/question-circle-solid.svg';

import Stack from '../../layout/stack/Stack';
import Tooltip from '../tooltip/Tooltip';
import { useAppContext } from '../../../layouts/AppLayout';
import { ThemeProp } from '../../theme_utils';

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
    initialState?: any;
};

const StyledTable = styled.div<ThemeProp>`
    width: 100%;
    background: ${props => props.theme[props.innerTheme].table.background};

    .header,
    .footer {
        position: sticky;
        z-index: 1;
        width: fit-content;
    }

    .header {
        top: 0;
        box-shadow: 0px 3px 3px #ccc;
    }

    .body {
        position: relative;
        z-index: 0;
    }

    [data-sticky-td] {
        position: sticky;
    }

    [data-sticky-last-left-td] {
        box-shadow: 2px 0px 3px #ccc;
    }

    [data-sticky-first-right-td] {
        box-shadow: -2px 0px 3px #ccc;
    }

    &::-webkit-scrollbar {
        width: 3px;
        height: 3px;
        paddingRight: 20px;
    }

    &::-webkit-scrollbar-track {
        background: ${tokens.colors.blue100};
    }

    &::-webkit-scrollbar-thumb {
        background-color: ${tokens.colors.blue300};
        border-radius: 25px;
    }
`;

const StyledHead = styled.div`
    width: 100%;
    position: sticky;
    z-index: 1;
    top: 0;
`;

const StyledBody = styled(motion.div)`
    width: 100%;
    position: relative;
    z-index: 0;
`;

const StyledCellRow = styled(motion.div)``;

const StyledHeaderCell = styled.div<{ isNumerical?: boolean } & ThemeProp>`
    font-weight: 500;
    color: ${props => props.theme[props.innerTheme].table.headerColor};
    padding-top: 1rem;
    padding-bottom: 0.5rem;
    padding-left: 1rem;
    padding-right: 1rem;
    text-align: ${props => (props.isNumerical ? 'right' : 'left')};
    position: sticky;
    top: 0;
    border-bottom: 2px ${tokens.colors.gray400} solid;
    background: ${props => props.theme[props.innerTheme].table.headerBackground};
    font-size: 1rem;
    font-weight: 500;
`;

const StyledCell = styled.div<{ isNumerical?: boolean }>`
    font-weight: 500;
    color: ${tokens.colors.gray800};
    padding: 1.25rem 1rem;
    font-size: 0.75rem;
    text-align: ${props => (props.isNumerical ? 'right' : 'left')};
    vertical-align: middle;
    border-top: 1px ${tokens.colors.gray400} solid;
    
`;

const StyledSortIndicator = styled(Box)<{ active?: boolean }>`
    line-height: 0.85;
    font-size: 0.75rem;
    color: ${props => (props.active ? tokens.colors.ultramarine : tokens.colors.gray400)};
`;

const StyledInlineSearch = styled.input`
    border: none;
    color: ${tokens.colors.ultramarine};
    font-weight: 400;
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

const StyledSkeletonCell = styled(motion.div)<{ skeletonHeight?: number }>`
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

const Table = React.forwardRef((props: Props, ref) => {
    const { theme } = useAppContext();
    const { columns, data, setTableState, isLoading, skeletonHeight, isFetchingMore, initialState } = props;
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, state } = useTable(
        { columns: columns as any, data, autoResetSortBy: false, initialState } as any,
        useSortBy,
        useFlexLayout,
        useSticky
    );

    const sortBy = (state as any)?.sortBy[0];

    useEffect(() => {
        setTableState({ sortBy });
    }, [sortBy?.id, sortBy?.desc]);

    const searchOnClick = useCallback((event: MouseEvent) => {
        event.stopPropagation();
    }, []);

    return (
        <StyledTable {...getTableProps()} ref={ref as any} innerTheme={theme}>
            <StyledHead>
                {
                    // Loop over the header rows
                    headerGroups.map(headerGroup => (
                        // Apply the header row props
                        <div {...headerGroup.getHeaderGroupProps()}>
                            {
                                // Loop over the headers in each row
                                headerGroup.headers.map(column => {
                                    // Apply the header cell props
                                    const justify = (column as any)?.isNumerical ? 'end' : 'start';
                                    const isSearchable = (column as any)?.isSearchable;
                                    const onSearch = (column as any)?.onSearch;
                                    const disableSortBy = (column as any)?.disableSortBy;
                                    const helpText = (column as any)?.helpText;

                                    console.log('elp', helpText);
                                    return (
                                        <StyledHeaderCell
                                            innerTheme={theme}
                                            {...column.getHeaderProps((column as any).getSortByToggleProps())}
                                            isNumerical={(column as any).isNumerical}
                                        >
                                            <Stack gap='small'>
                                                <Stack orientation='horizontal' width='100%' justify={justify} gap='small' align='center'>
                                                    <Box>
                                                        {
                                                            // Render the header
                                                            column.render('Header')
                                                        }
                                                    </Box>
                                                    {!disableSortBy && (
                                                        <Stack>
                                                            <StyledSortIndicator
                                                                active={(column as any).isSorted && !(column as any).isSortedDesc}
                                                            >
                                                                &nbsp;▲
                                                            </StyledSortIndicator>
                                                            <StyledSortIndicator
                                                                active={(column as any).isSorted && (column as any).isSortedDesc}
                                                            >
                                                                &nbsp;▼
                                                            </StyledSortIndicator>
                                                        </Stack>
                                                    )}
                                                    {helpText && (
                                                        <Tooltip tip={helpText}>
                                                            <Box>
                                                                <QuestionMark width='12' height='12' color={tokens.colors.ultramarine} />
                                                            </Box>
                                                        </Tooltip>
                                                    )}
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
                        </div>
                    ))
                }
            </StyledHead>
            {isLoading && (
                <StyledBody>
                    {[...Array(20)].map((_, i) => (
                        <StyledCellRow key={`top-tableskeleton-${i}`}>
                            <StyledSkeletonCell skeletonHeight={skeletonHeight} />
                        </StyledCellRow>
                    ))}
                </StyledBody>
            )}

            {!isLoading && (
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
                                    animate={{ opacity: 1, transition: { delay: 0.001 * rowNumber } }}
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
                    <AnimatePresence>
                        {isFetchingMore &&
                            [...Array(3)].map((_, i) => (
                                <StyledCellRow key={`bottom-tableskeleton-${i}`}>
                                    <StyledSkeletonCell
                                        skeletonHeight={skeletonHeight}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    />
                                </StyledCellRow>
                            ))}
                    </AnimatePresence>
                </StyledBody>
            )}
        </StyledTable>
    );
});

export default Table;
