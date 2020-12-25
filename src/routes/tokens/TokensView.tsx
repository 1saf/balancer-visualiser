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

import Web3Utils from 'web3-utils';
import { useAppContext } from '../../layouts/AppLayout';
import Feedback from '../../components/design/feedback/Feedback';

type Props = {};

const StyledTokenSymbol = styled.span`
    display: inline-block;
    color: ${tokens.colors.gray600};
`;

const StyledTokenName = styled.span`
    display: inline-block;
    color: ${tokens.colors.raisin_black};
`;

const StyledTokensView = styled(Stack)`
    display: flex;
    overflow: hidden;

    @media (min-width: 1024px) {
        justify-content: center;
        width: 1164px;
        margin: 0 auto;
        max-width: 1164px;
    }
`;

const TokenViewBorderContainer = styled(Box)`
    display: flex;
    border: 2px solid ${props => props.theme.borderColor};
    border-radius: 10px;
    width: 100%;
    height: 100%;
    overflow: hidden;
`;

const StyledTokenIcon = styled(Box)`
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 12px;
    overflow: hidden;
    & > img {
        width: 24px;
        height: 24px;

        &:before {
            content: ' ';
            display: block;
            position: absolute;
            height: 24px;
            width: 24px;
            background: #FFF;
    }
`;

const TokensView: FC<Props> = props => {
    const {} = props;
    const tableContainerRef = useRef(null);
    const [tableState, setTableState] = useState({} as { sortBy: { id: string; desc: boolean } });
    const {
        cachedTokenData,
        fetchMoreTokens,
        isFetchingMoreTokens,
        isFetchingTokens,
        setTokenSearchText,
        tokenSearchText,
        isLoading,
        isLoadingTokenPrices,
        tokenPrices,
    } = useTokensViewState({
        orderDesc: tableState?.sortBy?.desc,
        orderKey: tableState?.sortBy?.id,
    });
    const { setHeading } = useAppContext();

    useEffect(() => {
        setHeading('Tokens');
    }, []);

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
                    <Stack orientation='horizontal' gap='medium' align='center'>
                        <StyledTokenIcon>
                            <img
                                src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${Web3Utils.toChecksumAddress(
                                    row?.original?.contract_address
                                )}/logo.png`}
                            />
                        </StyledTokenIcon>
                        <Stack gap='small'>
                            <StyledTokenName>{String(value)}</StyledTokenName>
                            <StyledTokenSymbol>{String(row?.original?.symbol)}</StyledTokenSymbol>
                        </Stack>
                    </Stack>
                ),
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
                accessor: (row: any) => (tokenPrices || {})[row?.contract_address]?.usd,
                width: 100,
                maxWidth: 100,
                isNumerical: true,
                Cell: ({ value }: any) => <span>{numeral(value).format('$0.00a')}</span>,
                disableSortBy: true,
            },
            {
                Header: 'Calculated Price',
                accessor: 'price',
                width: 120,
                maxWidth: 120,
                isNumerical: true,
                Cell: ({ value }: any) => <span>{numeral(value).format('$0.00a')}</span>,
                disableSortBy: true,
                helpText: 'The price that was used to calculate total liquidity as a product of the number of units.',
            },
            {
                Header: 'Total Liquidity',
                accessor: 'liquidity',
                width: 120,
                maxWidth: 120,
                isNumerical: true,
                Cell: ({ value }: any) => <span>{numeral(value).format('$0.00a')}</span>,
            },
            {
                Header: 'Units',
                accessor: 'balance',
                width: 100,
                maxWidth: 100,
                isNumerical: true,
                Cell: ({ value }: any) => <span>{numeral(value).format('0.00a')}</span>,
                disableSortBy: true,
                helpText: 'The total amount of tokens in circulation across all pools.',
            },
        ],
        [handleTokenSearch, isLoadingTokenPrices]
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

    if (!cachedTokenData) return null;
    return (
        <StyledTokensView paddingY='base' gap='base'>
            <Feedback paddingBottom='small' emotion='neutral'>
                Please note that token Liquidity is calculated every hour against the price of the token at that hour.
            </Feedback>
            <TokenViewBorderContainer>
                <Table
                    setTableState={setTableState}
                    ref={tableContainerRef}
                    isLoading={isLoading || isLoadingTokenPrices}
                    skeletonHeight={75}
                    columns={columns}
                    data={cachedTokenData}
                    isFetchingMore={isFetchingTokens}
                    initialState={{
                        sortBy: [
                            {
                                id: 'liquidity',
                                desc: true,
                            },
                        ],
                    }}
                ></Table>
            </TokenViewBorderContainer>
        </StyledTokensView>
    );
};

export default TokensView;
