import { addMinutes, getUnixTime, subHours } from 'date-fns';
import { flatten } from 'lodash';
import { SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce/lib';
import { GraphQLResponse, useInfiniteGraphQuery } from '../../../api/graphql';
import { useAppContext } from '../../../layouts/AppLayout';
import { TODAY } from '../../../utils';
import { useEthTimestampBlocks } from '../../dashboard/state/hooks';
import numeral from 'numeral';

import algoliasearch from 'algoliasearch';
import { useQuery } from 'react-query';

const searchClient = algoliasearch('67VZ0M7HPB', 'f01f344ab1d564284800a683799020f6');
const searchIndex = searchClient.initIndex('prod_Pools_Search_Index');

type PoolsData = {
    pools: {
        id: string;
        tokens: {
            address: string;
            denormWeight: string;
            symbol: string;
        }[];
        totalSwapFee: string;
        totalSwapVolume: string;
    }[];
};

const getPoolSharesQuery = (poolIds: string[] = [], blockNumber?: number) => {
    // not my ideal solution but ok
    const blockClause = blockNumber !== undefined ? `, block: { number: ${blockNumber} }` : '';
    const idClause = poolIds.length ? `id_in: [${poolIds.map(id => `"${id}"`)}]` : '';
    const whereClause = blockClause || idClause ? `, where: { ${idClause} }` : '';
    return `
    query poolSharesQuery($first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
        pools(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection${whereClause}${blockClause}) {
            id
            totalSwapVolume
            totalSwapFee
            tokens {
                address
                symbol
                denormWeight
            }
        }
    }
    `;
};

const getPoolSearchResults = async (key: string, poolSearchText: string) => {
    if (poolSearchText) {
        const result = await searchIndex.search(poolSearchText);
        return {
            pools: result?.hits || [],
        };
    }
    return {
        pools: [],
    };
};

export const usePoolsViewState = () => {
    const [tableState, setTableState] = useState({} as { sortBy: { id: string; desc: boolean } });
    const [offset, setOffset] = useState(0);
    const [poolSearchText, setPoolSearchText] = useState('');
    const { setScrollToEndHandler } = useAppContext();

    const yesterday = subHours(TODAY, 24);

    const { isLoading: isLoadingEthBlocks, blocks, rawData } = useEthTimestampBlocks([
        {
            first_ten: getUnixTime(yesterday),
            last_ten: getUnixTime(addMinutes(yesterday, 10)),
        },
    ] as any[]);

    const yesterdayBlockNumber = blocks[0]?.blockNumber;

    const handleTokenSearch = useDebouncedCallback(async (event: SyntheticEvent) => {
        const searchText = (event.target as any).value as string;
        setPoolSearchText(searchText);
    }, 250);

    const { data: poolsSearchResponse, isLoading: isLoadingPoolsSearchResults } = useQuery(
        ['pools', poolSearchText],
        getPoolSearchResults,
        { enabled: poolSearchText }
    );

    // object id is the same as the pool id - don't have to cast for ts
    const searchedPools = (poolsSearchResponse?.pools || []).map(pool => pool.objectID);

    const { data: poolsResponse, isLoading, isFetching, isFetchingMore, fetchMore } = useInfiniteGraphQuery<GraphQLResponse<PoolsData>>(
        [
            'poolsList',
            {
                searchedPools,
                first: 50,
                skip: 0,
                orderBy: tableState?.sortBy?.id,
                orderDirection: tableState?.sortBy?.desc ? 'desc' : 'asc',
            },
        ],
        getPoolSharesQuery(searchedPools),
        {
            getFetchMore: () => {
                setOffset(offset + 50);
                return {
                    skip: offset,
                };
            },
        }
    );

    const {
        data: yesterdayPoolsResponse,
        isLoading: isLoadingYesterdayPools,
        isFetching: isFetchingYesterdayPools,
        isFetchingMore: isFetchingMoreYesterdayPools,
        fetchMore: fetchMoreYesterdayPools,
    } = useInfiniteGraphQuery<GraphQLResponse<PoolsData>>(
        [
            'yesterdayPoolsList',
            {
                searchedPools,
                first: 50,
                skip: 0,
                orderBy: tableState?.sortBy?.id,
                orderDirection: tableState?.sortBy?.desc ? 'desc' : 'asc',
            },
        ],
        getPoolSharesQuery(searchedPools, yesterdayBlockNumber),
        {
            getFetchMore: () => {
                setOffset(offset + 50);
                return {
                    skip: offset,
                };
            },
            enabled: yesterdayBlockNumber !== undefined,
        }
    );

    const poolsData = flatten((poolsResponse || []).map(response => response.data?.pools)).filter(pool => pool?.tokens?.length);
    const yseterdayData = flatten((yesterdayPoolsResponse || []).map(response => response.data?.pools)).filter(
        pool => pool?.tokens?.length
    );
    const poolsDataWithVolume = poolsData.map((poolData, i) => {
        if (poolData?.id !== yseterdayData[i]?.id) return {
            ...poolData,
        };
        return {
            ...poolData,
            volume24h: numeral(poolData?.totalSwapVolume).value() - numeral(yseterdayData[i]?.totalSwapVolume).value(),
        };
    });

    const handleScrollToEnd = useCallback(() => {
        // ensure that server doesn't get spammed while its already attempting
        // a request to fetch more data if the user scrolls up and back down
        // also do not perform a search when there is search text as it goes
        // through algolia and we want to preserve those expensive ass queries
        if (!isFetching || !isFetchingMore) {
            fetchMore();
            fetchMoreYesterdayPools();
        }
    }, [isFetching, isFetchingMore]);

    useEffect(() => {
        setScrollToEndHandler(handleScrollToEnd);
    }, []);

    return {
        setTableState,
        poolsData: poolsDataWithVolume,
        isLoading,
        isFetching,
        handleTokenSearch,
    };
};
