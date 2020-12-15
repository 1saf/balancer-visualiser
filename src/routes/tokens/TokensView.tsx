import React, { FC, useEffect, useRef, useState } from 'react';
import Table from '../../components/design/table/Table';
import Box from '../../components/layout/box/Box';
import Grid from '../../components/layout/grid/Grid';
import { useTokensViewState } from './state/hooks';

import numeral from 'numeral';
import Stack from '../../components/layout/stack/Stack';
import styled from 'styled-components';
import { tokens } from '../../style/Theme';
import { useDebouncedCallback } from 'use-debounce/lib';

type Props = {};

const StyledTokenSymbol = styled.span`
    display: inline-block;
    color: ${tokens.colors.blue400};
`;

const StyledTokensView = styled(Box)`
    display: flex;
    flex-grow: 1;
    overflow: hidden;
`;

const columns = [
    {
        Header: 'Token',
        accessor: 'name', // accessor is the "key" in the data
        Cell: ({ row, value }: any) => (
            <Stack gap='small'>
                <span>{String(value)}</span>
                <StyledTokenSymbol>{String(row?.original?.symbol)}</StyledTokenSymbol>
            </Stack>
        ),
        minWidth: 400,
        width: 400,
        maxWidth: 400,
    },
    {
        Header: 'Price',
        accessor: 'price',
        isNumerical: true,
        Cell: ({ value }: any) => <span>{numeral(value).format('$0.00a')}</span>,
    },
    {
        Header: 'Total Liquidity',
        accessor: 'liquidity',
        isNumerical: true,
        Cell: ({ value }: any) => <span>{numeral(value).format('$0.00a')}</span>,
    },
    {
        Header: 'Units',
        accessor: 'balance',
        isNumerical: true,
        Cell: ({ value }: any) => <span>{numeral(value).format('$0.00a')}</span>,
    },
];

const TokensView: FC<Props> = props => {
    const {} = props;
    const tableContainerRef = useRef(null);
    const [tableState, setTableState] = useState({} as { sortBy: { id: string; desc: boolean } });
    const { tokenPrices, fetchMoreTokens, isFetchingMoreTokens, isFetchingTokens } = useTokensViewState({
        orderDesc: tableState?.sortBy?.desc,
        orderKey: tableState?.sortBy?.id,
    });

    const loadMore = useDebouncedCallback(() => {
        if (tableContainerRef && tableContainerRef.current.offsetHeight + tableContainerRef.current.scrollTop >= tableContainerRef.current.scrollHeight - 50) {
            // ensure that server doesn't get spammed while its already attempting
            // a request to fetch more data if the user scrolls up and back down
            if (!isFetchingTokens || !isFetchingMoreTokens) {
                fetchMoreTokens();
            }
        }
    }, 100);

    useEffect(() => {
        if (tableContainerRef) {

            tableContainerRef.current.onscroll = loadMore.callback;
        }
    }, [tableContainerRef]);

    if (!tokenPrices) return null;
    return (
        <StyledTokensView>
            <Grid width='100%' height='100%' paddingY='large' paddingX={['base', 'base', 'base', 'none']}>
                <Box ref={tableContainerRef} spanX={12} overflowY='scroll'>
                    <Table setTableState={setTableState} columns={columns} data={tokenPrices}></Table>
                </Box>
            </Grid>
        </StyledTokensView>
    );
};

export default TokensView;
