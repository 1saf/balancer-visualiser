import { useInfiniteQuery, useQuery } from 'react-query';
import { BALANCER_SUBGRAPH_URL, GraphQLResponse, subgraphPOST } from '../../../api/graphql';
import firebase from 'firebase';

import tokensQuery from '../query/tokens.graphql';
import poolCountQuery from '../query/pool_count.graphql';

import { chunk, flatten, last } from 'lodash';
import { format, fromUnixTime, getUnixTime, startOfHour, formatDistanceToNow } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { useState } from 'react';

import algoliasearch from 'algoliasearch';
import { GET } from '../../../utils';

const searchClient = algoliasearch('67VZ0M7HPB', 'f01f344ab1d564284800a683799020f6');
const searchIndex = searchClient.initIndex('prod_Token_Search_Index');

type TokenPrice = {
    name: string;
    poolLiquidity: string;
    price: string;
    symbol: string;
};

type SortAndPaginationOptions = {
    orderKey?: string;
    orderDesc?: boolean;
    limit?: number;
    offset?: number;
    tokenSearchText?: string;
};

export type PoolData = {
    pools: {
        tokens: {
            balance: string;
            address: string;
            name: string;
            symbol: string;
        }[];
    }[];
};

type TokenDocument = { name: string; liquidity: number; symbol: string; balance: number; price: number; timestamp: number };

const getTokenData = async (key: string, { orderDesc, orderKey, tokenSearchText }: SortAndPaginationOptions, cursor: any) => {
    const now = new Date();
    const hourlySnapshotTimestamp = getUnixTime(startOfHour(now));
    const dateKey = format(utcToZonedTime(now, 'Etc/UTC'), 'yyyyMMdd');
    let orderDirection: firebase.firestore.OrderByDirection = 'desc';
    if (!orderDesc) orderDirection = 'asc';

    if (tokenSearchText) {
        const result = await searchIndex.search(tokenSearchText);
        return {
            tokens: result?.hits || [],
            cursor: null,
        };
    }

    let hourlyTokenRef: any = firebase
        .firestore()
        .collection('dailydata')
        .doc(dateKey)
        .collection('hourlytokendata')
        .where('timestamp', '==', hourlySnapshotTimestamp)
        .orderBy(orderKey || 'liquidity', orderDirection);


    if (cursor) {
        hourlyTokenRef = await hourlyTokenRef.startAfter(cursor).limit(25).get();
    } else {
        hourlyTokenRef = await hourlyTokenRef.limit(25).get();
    }
    
    const tokens = hourlyTokenRef.docs.map((doc: any) => doc.data());

    return {
    tokens,
        cursor: last(hourlyTokenRef.docs),
    };
};

const PoolsBalanceQuery = (i: number) => `
    query PoolBalanceQuery {
        pools(first: 1000, skip: ${1000 * i}, where: {active: true}) {
            tokens {
                balance
                name
                symbol
                address
            }
        }
    }
`;

const getTokenPrices = async () => {
    // get number of pools on balancer
    const poolCountResponse = await subgraphPOST<
        GraphQLResponse<{
            balancer: { finalizedPoolCount: number };
        }>
    >(BALANCER_SUBGRAPH_URL)(poolCountQuery)('', {});

    console.log('c', poolCountResponse);

    const poolCount = Math.abs(poolCountResponse?.data?.balancer?.finalizedPoolCount);

    // add some padding to the poolcount just in case to grab
    // any stragglers that might not be covered by the finalised
    // pool count
    const poolCountWithMargin = poolCount + 1000;

    // how many requests to make
    const iterations = Math.ceil(poolCountWithMargin / 500);

    const promises = [...new Array(iterations)].map(async (_, i) => {
        const poolBalanceResponse = (await subgraphPOST<GraphQLResponse<PoolData>>(BALANCER_SUBGRAPH_URL)(PoolsBalanceQuery(i))('', {}));
        return poolBalanceResponse;
    });

    const resolvedResponses = await Promise.all(promises);
    const flattenedResponses = resolvedResponses.map(response => response?.data?.pools).flat();

    const uniqueTokensMap: Record<string, string> = {};

    for (const response of flattenedResponses) {
        for (const token of response.tokens) {
            if (uniqueTokensMap[token.address]) continue;
            uniqueTokensMap[token.address] = token.symbol;
        }
    }

    // coingecko has a limit on how many tokens you can request at a single time
    const uniqueTokenAddresses = chunk(Object.keys(uniqueTokensMap), 100);
    const tokenPricesResponses = uniqueTokenAddresses.map(async addresses => {
        return (await GET(
            `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${addresses.join(',')}&vs_currencies=usd`
        )) as TokenPrice;
    });

    const resolvedTokenPricesResponses = await Promise.all(tokenPricesResponses);
    const tokenPrices = Object.assign.apply(Object, resolvedTokenPricesResponses as any);
    return tokenPrices;
};

export const useTokensViewState = (sortAndOrderOpts: SortAndPaginationOptions) => {
    const [tokenSearchText, setTokenSearchText] = useState('');

    const {
        data: tokenDbResponses,
        isLoading,
        fetchMore: fetchMoreTokens,
        isFetching: isFetchingTokens,
        isFetchingMore: isFetchingMoreTokens,
    } = useInfiniteQuery<{ tokens: any[]; cursor: any }>(
        [
            'tokendata',
            {
                ...sortAndOrderOpts,
                tokenSearchText,
            },
        ],
        getTokenData,
        {
            getFetchMore: lastPage => {
                return lastPage.cursor;
            },
        }
    );

    const { data: tokenPrices, isLoading: isLoadingTokenPrices } = useQuery('tokenPrices', getTokenPrices);
    const cachedTokenData = flatten((tokenDbResponses || []).map(response => response.tokens));
    const lastRefreshedAt = formatDistanceToNow((fromUnixTime(cachedTokenData[0]?.timestamp || 0)));

    return {
        cachedTokenData,
        isLoading,
        fetchMoreTokens,
        isFetchingTokens,
        isFetchingMoreTokens,
        setTokenSearchText,
        tokenSearchText,
        tokenPrices,
        isLoadingTokenPrices,
        lastRefreshedAt,
    };
};
