import React, { FC, useEffect, useState } from 'react';
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
    },
    {
        Header: 'Price',
        accessor: 'price',
        isNumerical: true,
        Cell: ({ value }: any) => numeral(value).format('$0.00a'),
    },
    {
        Header: 'Total Liquidity',
        accessor: 'liquidity',
        isNumerical: true,
        Cell: ({ value }: any) => numeral(value).format('$0.00a'),
    },
    {
        Header: 'Units',
        accessor: 'balance',
        isNumerical: true,
        Cell: ({ value }: any) => numeral(value).format('0.00a'),
    },
];

const TokensView: FC<Props> = props => {
    const {} = props;
    const [tableState, setTableState] = useState({} as { sortBy: { id: string; desc: boolean } });
    const [offset, setOffset] = useState(0);
    const { tokenPrices, fetchMoreTokens, isFetchingMoreTokens, isFetchingTokens } = useTokensViewState({
        orderDesc: tableState?.sortBy?.desc,
        orderKey: tableState?.sortBy?.id,
        offset,
    });

    const loadMore = useDebouncedCallback(() => {
        if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.scrollHeight - 50) {
            // ensure that server doesn't get spammed while its already attempting
            // a request to fetch more data if the user scrolls up and back down
            if (!isFetchingTokens || !isFetchingMoreTokens) {
                fetchMoreTokens();
            }
        }
    }, 100);

    useEffect(() => {
        window.onscroll = loadMore.callback;
    }, []);

    if (!tokenPrices) return null;
    return (
        <Grid width='100%' paddingY='large' paddingX={['base', 'base', 'base', 'none']}>
            <Box spanX={12}>
                <Table setTableState={setTableState} columns={columns} data={tokenPrices}></Table>
            </Box>
        </Grid>
    );
};

export default TokensView;
