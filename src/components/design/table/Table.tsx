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
    box-shadow: ${props => props.theme.shadow};
    border: 1px solid ${tokens.colors.gray400};
    border-radius: 10px;
    overflow: hidden;
    overflow-x: scroll;
    min-width: auto !important;

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
        paddingright: 20px;
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

const StyledCellRow = styled(motion.div)`
    width: 100% !important;

    @media (max-width: 768px) {
        display: flex;
    }
`;

const StyledHeaderCell = styled.div<{ isNumerical?: boolean; mobileWidth?: number } & ThemeProp>`
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

    @media (max-width: 768px) {
    }
`;

const StyledCell = styled.div<{ isNumerical?: boolean; mobileWidth?: number } & ThemeProp>`
    font-weight: 500;
    color: ${props => props.theme[props.innerTheme].table.cellPrimaryColor};
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
    font-weight: 500;
    outline: none;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
    background: transparent;

    ::placeholder {
        color: ${tokens.colors.blue400};
    }
`;

const StyledSkeletonCell = styled(motion.div)<{ skeletonHeight?: number; width: number, grow?: boolean }>`
    flex-grow: ${props => props.grow ? 1 : 0};
    min-width: ${props => props.width}px;
    background-color: ${tokens.colors.gray900};
    padding: 1.25rem 1rem;
    border-top: 1px ${tokens.colors.gray400} solid;

    min-height: ${props => props.skeletonHeight}px;
    height: ${props => props.skeletonHeight}px;
`;

const SkeletonText = styled(Stack)`
    animation: skeleton linear 2s infinite;
    -webkit-animation: skeleton linear 2s infinite;
    border-radius: 10px;
    @keyframes skeleton {
        0% {
            background-color: ${tokens.colors.gray700};
        }
        50% {
            background-color: ${tokens.colors.gray900};
        }
        100% {
            background-color: ${tokens.colors.gray700};
        }
    }

    @-webkit-keyframes skeleton {
        0% {
            background-color: ${tokens.colors.gray700};
        }
        50% {
            background-color: ${tokens.colors.gray900};
        }
        100% {
            background-color: ${tokens.colors.gray700};
        }
    }
`;

const SkeletonRow = () => {
    return (
        <Stack orientation='horizontal' width='100%'>
            <StyledSkeletonCell width={200} grow={true}>
                <Stack gap='small'>
                    <SkeletonText height='0.85rem' width='75%' />
                    <SkeletonText height='0.85rem' width='15%' />
                </Stack>
            </StyledSkeletonCell>
            <StyledSkeletonCell width={150}>
                <SkeletonText height='0.85rem' width='35%' float='right' />
            </StyledSkeletonCell>

            <StyledSkeletonCell width={150}>
                <SkeletonText height='0.85rem' width='35%' float='right' />
            </StyledSkeletonCell>
        </Stack>
    );
};

const StyledHeaderWrapper = styled(Box)`
    width: 100% !important;

    @media (max-width: 768px) {
        display: flex;
    }
`;

const Table = React.forwardRef((props: Props, ref) => {
    const { theme } = useAppContext();
    const { columns, data, setTableState, isLoading, skeletonHeight, isFetchingMore, initialState } = props;
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, state } = useTable(
        { columns: columns as any, data, autoResetSortBy: false, initialState } as any,
        useSortBy,
        useBlockLayout,
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
                        <StyledHeaderWrapper {...headerGroup.getHeaderGroupProps()}>
                            {
                                // Loop over the headers in each row
                                headerGroup.headers.map(column => {
                                    // Apply the header cell props
                                    const justify = (column as any)?.isNumerical ? 'end' : 'start';
                                    const isSearchable = (column as any)?.isSearchable;
                                    const onSearch = (column as any)?.onSearch;
                                    const disableSortBy = (column as any)?.disableSortBy;
                                    const helpText = (column as any)?.helpText;
                                    const extraStyle = (column as any)?.extraStyle;
                                    const style = (column as any)?.style;
                                    return (
                                        <StyledHeaderCell
                                            innerTheme={theme}
                                            {...column.getHeaderProps((column as any).getSortByToggleProps())}
                                            isNumerical={(column as any).isNumerical}
                                            style={{
                                                ...style,
                                                ...extraStyle,
                                            }}
                                        >
                                            <Stack gap='small'>
                                                <Stack
                                                    orientation='horizontal'
                                                    width='100%'
                                                    height='100%'
                                                    justify={justify}
                                                    gap='small'
                                                    align='center'
                                                >
                                                    <Stack>
                                                        {
                                                            // Render the header
                                                            column.render('Header')
                                                        }
                                                    </Stack>
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
                        </StyledHeaderWrapper>
                    ))
                }
            </StyledHead>
            {isLoading && (
                <StyledBody>
                    {[...Array(20)].map((_, i) => (
                        <StyledCellRow key={`top-tableskeleton-${i}`}>
                            <SkeletonRow />
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
                                                <StyledCell
                                                    isNumerical={(cell?.column as any).isNumerical}
                                                    innerTheme={theme}
                                                    {...cell.getCellProps()}
                                                    style={{
                                                        ...(cell?.column as any).style,
                                                        ...(cell?.column as any).extraStyle,
                                                    }}
                                                >
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
                                    <SkeletonRow />
                                </StyledCellRow>
                            ))}
                    </AnimatePresence>
                </StyledBody>
            )}
        </StyledTable>
    );
});

export default Table;
