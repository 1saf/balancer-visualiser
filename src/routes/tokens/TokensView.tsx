import React, { FC, SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
    color: ${tokens.colors.gray600};
`;

const StyledTokenName = styled.span`
    display: inline-block;
    color: ${tokens.colors.raisin_black};
`;

const StyledTokensView = styled(Box)`
    display: flex;
    flex-grow: 1;
    overflow: hidden;
`;

const StyledScrollBarContainer = styled(Box)`
    &::-webkit-scrollbar {
        width: 6px;
        padding: 1px;
    }

    &::-webkit-scrollbar-track {
        background: ${tokens.colors.blue100};
    }

    &::-webkit-scrollbar-thumb {
        background-color: ${tokens.colors.ultramarine};
        border-radius: 25px;
    }
`;
const TokensView: FC<Props> = props => {
    const {} = props;
    const tableContainerRef = useRef(null);
    const [tableState, setTableState] = useState({} as { sortBy: { id: string; desc: boolean } });
    const {
        tokenPrices,
        fetchMoreTokens,
        isFetchingMoreTokens,
        isFetchingTokens,
        setTokenSearchText,
        tokenSearchText,
        isLoading,
    } = useTokensViewState({
        orderDesc: tableState?.sortBy?.desc,
        orderKey: tableState?.sortBy?.id,
    });

    const handleTokenSearch = useDebouncedCallback(async (event: SyntheticEvent) => {
        const searchText = (event.target as any).value as string;
        setTokenSearchText(searchText);
    }, 250);

    const columns = useMemo(
        () => [
            {
                Header: 'Token',
                accessor: 'name', // accessor is the "key" in the data
                Cell: ({ row, value }: any) => (
                    <Stack gap='small'>
                        <StyledTokenName>{String(value)}</StyledTokenName>
                        <StyledTokenSymbol>{String(row?.original?.symbol)}</StyledTokenSymbol>
                    </Stack>
                ),
                minWidth: 400,
                width: 400,
                maxWidth: 400,
                isSearchable: true,
                onSearch: (event: SyntheticEvent) => {
                    event.persist();
                    handleTokenSearch.callback(event);
                },
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
        ],
        [handleTokenSearch]
    );

    const loadMore = useDebouncedCallback(() => {
        if (
            tableContainerRef &&
            tableContainerRef.current.offsetHeight + tableContainerRef.current.scrollTop >= tableContainerRef.current.scrollHeight - 50
        ) {
            // ensure that server doesn't get spammed while its already attempting
            // a request to fetch more data if the user scrolls up and back down
            // also do not perform a search when there is search text as it goes
            // through algolia and we want to preserve those expensive ass queries
            if (!isFetchingTokens || (!isFetchingMoreTokens && !tokenSearchText)) {
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
                <StyledScrollBarContainer ref={tableContainerRef} spanX={12} overflowY='scroll'>
                    <Table
                        setTableState={setTableState}
                        isLoading={isLoading}
                        skeletonHeight={75}
                        columns={columns}
                        data={tokenPrices}
                    ></Table>
                </StyledScrollBarContainer>
            </Grid>
        </StyledTokensView>
    );
};

export default TokensView;
