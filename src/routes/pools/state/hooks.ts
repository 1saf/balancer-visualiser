import { flatten } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { GraphQLResponse, useInfiniteGraphQuery } from '../../../api/graphql';
import { useAppContext } from '../../../layouts/AppLayout';
import poolDataQuery from '../query/pools.graphql';

type PoolsData = {
    pools: {
        tokens: {
            address: string;
            denormWeight: string;
            symbol: string;
        }[];
        totalSwapFee: string;
        totalSwapVolume: string;
    }[];
};

export const usePoolsViewState = () => {
    const [tableState, setTableState] = useState({} as { sortBy: { id: string; desc: boolean } });
    const [offset, setOffset] = useState(0);
    const [poolSearchText, setPoolSearchText] = useState('');
    const { setScrollToEndHandler } = useAppContext();

    const { data: poolsResponse, isLoading, isFetching, isFetchingMore, fetchMore } = useInfiniteGraphQuery<GraphQLResponse<PoolsData>>(
        ['blockTimestamps', { first: 50, skip: 0, orderBy: tableState?.sortBy?.id, orderDirection: tableState?.sortBy?.desc ? 'desc' : 'asc' }],
        poolDataQuery,
        {
            getFetchMore: () => {
                setOffset(offset + 50);
                return {
                    skip: offset,
                };
            },
        }
    );

    const handleScrollToEnd = useCallback(() => {
        // ensure that server doesn't get spammed while its already attempting
        // a request to fetch more data if the user scrolls up and back down
        // also do not perform a search when there is search text as it goes
        // through algolia and we want to preserve those expensive ass queries
        if (!isFetching || !isFetchingMore) {
            fetchMore();
        }
    }, [isFetching, isFetchingMore]);

    useEffect(() => {
        setScrollToEndHandler(handleScrollToEnd);
    }, []);

    const poolsData = flatten((poolsResponse || []).map(response => response.data?.pools)).filter(pool => pool?.tokens?.length);

    return {
        setTableState,
        poolsData,
        isLoading,
        isFetching,
    };
};
