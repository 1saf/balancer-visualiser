import React, { FC, SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Table, { StyledSkeletonCell } from '../../components/design/table/Table';
import { useTokensViewState } from './state/hooks';

import numeral from 'numeral';
import Stack from '../../components/layout/stack/Stack';
import styled from 'styled-components';
import { useDebouncedCallback } from 'use-debounce/lib';

import Web3Utils from 'web3-utils';
import { useAppContext } from '../../layouts/AppLayout';
import Feedback from '../../components/design/feedback/Feedback';

import { ThemeProp } from '../../components/theme_utils';
import { tokens } from '../../style/Theme';
import { StyledTokenIcon } from '../../components/ui/token_icon/TokenIcon';
import { SkeletonText } from '../../components/design/skeleton/Skeleton';

type Props = {};

const StyledTokenSymbol = styled.span<ThemeProp>`
    display: inline-block;
    color: ${props => props.theme[props.innerTheme]?.table?.cellSecondaryColor};
`;

const StyledTokenName = styled.span<ThemeProp>`
    display: inline-block;
    max-width: 150px;
    line-height: 1.2;
    color: ${props => props.theme[props.innerTheme]?.table?.cellPrimaryColor};
`;

const StyledTokensView = styled(Stack)`
    padding: 0 1rem;
    padding-bottom: 0.5rem;

    @media (min-width: 1024px) {
        padding: 0;
        padding-bottom: 1rem;
        justify-content: center;
        width: 1164px;
        margin: 0 auto;
        max-width: 1164px;
    }
`;

const StyledPing = styled.span`
    color: ${tokens.colors.green400};
    font-size: 0.85rem;
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

const TokensView: FC<Props> = props => {
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
        lastRefreshedAt,
    } = useTokensViewState({
        orderDesc: tableState?.sortBy?.desc,
        orderKey: tableState?.sortBy?.id,
    });
    const { setHeading, theme, setScrollToEndHandler } = useAppContext();

    const handleTokenSearch = useDebouncedCallback(async (event: SyntheticEvent) => {
        const searchText = (event.target as any).value as string;
        setTokenSearchText(searchText);
    }, 250);

    const handleScrollToEnd = useCallback(() => {
        // ensure that server doesn't get spammed while its already attempting
        // a request to fetch more data if the user scrolls up and back down
        // also do not perform a search when there is search text as it goes
        // through algolia and we want to preserve those expensive ass queries
        if (!isFetchingTokens || (!isFetchingMoreTokens && !tokenSearchText)) {
            fetchMoreTokens();
        }
    }, [isFetchingTokens, isFetchingMoreTokens, tokenSearchText]);

    useEffect(() => {
        setHeading('Tokens');
        setScrollToEndHandler(handleScrollToEnd);
    }, []);

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
                            <StyledTokenName innerTheme={theme}>{String(value)}</StyledTokenName>
                            <StyledTokenSymbol innerTheme={theme}>{String(row?.original?.symbol)}</StyledTokenSymbol>
                        </Stack>
                    </Stack>
                ),
                style: {
                    flexGrow: 1,
                    minWidth: '200px',
                },
                isSearchable: true,
                onSearch: (event: SyntheticEvent) => {
                    event.persist();
                    handleTokenSearch.callback(event);
                },
            },
            {
                Header: 'Total Liquidity',
                accessor: 'liquidity',
                isNumerical: true,
                Cell: ({ value }: any) => <span>{numeral(value).format('$0.00a')}</span>,
                style: {
                    minWidth: '150px',
                },
            },
            {
                Header: 'Price',
                accessor: (row: any) => (tokenPrices || {})[row?.contract_address]?.usd,
                isNumerical: true,
                Cell: ({ value }: any) => <span>{numeral(value).format('$0.00a')}</span>,
                disableSortBy: true,
                style: {
                    minWidth: '150px',
                },
            },
        ],
        [handleTokenSearch, isLoadingTokenPrices, theme]
    );

    if (!cachedTokenData) return null;

    return (
        <StyledTokensView paddingY='base' gap='base'>
            <Stack gap='x-small'>
                <Feedback paddingBottom='small' emotion='neutral' marginTop={['medium', 'medium']}>
                    Please note that token Liquidity is calculated every hour against the price of the token at that hour.
                </Feedback>
                {!isLoading && <StyledPing>Liquidity data is representative of {lastRefreshedAt} ago.</StyledPing>}
            </Stack>
            <Table
                setTableState={setTableState}
                ref={tableContainerRef}
                isLoading={isLoading || isLoadingTokenPrices}
                skeletonHeight={75}
                columns={columns}
                data={cachedTokenData}
                isFetchingMore={isFetchingTokens}
                loadingElement={<SkeletonRow />}
                initialState={{
                    sortBy: [
                        {
                            id: 'liquidity',
                            desc: true,
                        },
                    ],
                }}
            ></Table>
        </StyledTokensView>
    );
};

export default TokensView;
