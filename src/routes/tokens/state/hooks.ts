import { useInfiniteQuery, usePaginatedQuery, useQuery } from 'react-query';
import { GraphQLResponse, useGraphQuery } from '../../../api/graphql';
import { useFirebase } from '../../../containers/App';
import firebase from 'firebase';

import tokensQuery from '../query/tokens.graphql';
import { da } from 'date-fns/locale';
import { flatten, last } from 'lodash';
import { format, getUnixTime, startOfHour } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { order } from 'styled-system';
import { useState } from 'react';

import algoliasearch from 'algoliasearch';

const searchClient = algoliasearch('67VZ0M7HPB', 'f01f344ab1d564284800a683799020f6');
const searchIndex = searchClient.initIndex('prod_Token_Search_Index');

type TokenPrice = {
    name: string;
    poolLiquidity: string;
    price: string;
    symbol: string;
};

type TokensQueryResponse = {
    tokenPrices: TokenPrice[];
};

type SortAndPaginationOptions = {
    orderKey?: string;
    orderDesc?: boolean;
    limit?: number;
    offset?: number;
    tokenSearchText?: string;
};

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
        hourlyTokenRef = await hourlyTokenRef.startAfter(cursor).limit(50).get();
    } else {
        hourlyTokenRef = await hourlyTokenRef.limit(50).get();
    }

    const tokens = hourlyTokenRef.docs.map((doc: any) => doc.data());
    return {
        tokens,
        cursor: last(hourlyTokenRef.docs),
    };
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

    const tokenPrices = (tokenDbResponses || []).map(response => response.tokens);

    return {
        tokenPrices: flatten(tokenPrices),
        isLoading,
        fetchMoreTokens,
        isFetchingTokens,
        isFetchingMoreTokens,
        setTokenSearchText,
        tokenSearchText,
    };
};
