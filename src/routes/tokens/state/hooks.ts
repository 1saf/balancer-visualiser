import { useInfiniteQuery, usePaginatedQuery, useQuery } from 'react-query';
import { GraphQLResponse, useGraphQuery } from '../../../api/graphql';
import { useFirebase } from '../../../containers/App';
import firebase from 'firebase';

import tokensQuery from '../query/tokens.graphql';
import { da } from 'date-fns/locale';
import { flatten, last } from 'lodash';
import { format } from 'date-fns';

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
};

const getTokenData = async (key: string, { orderDesc, orderKey }: SortAndPaginationOptions, cursor: any) => {
    const today = new Date();
    const dateKey = format(today, 'yyyyMMdd');

    let hourlyTokenRef: any = firebase
        .firestore()
        .collection('dailydata')
        .doc(dateKey)
        .collection('hourlytokendata')
        .orderBy(orderKey || 'liquidity', 'desc');

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
    const {
        data: tokenDbResponses,
        isLoading,
        fetchMore: fetchMoreTokens,
        isFetching: isFetchingTokens,
        isFetchingMore: isFetchingMoreTokens,
    } = useInfiniteQuery<{ tokens: any[]; cursor: any }>(['tokendata', sortAndOrderOpts], getTokenData, {
        getFetchMore: lastPage => {
            console.log('oos', lastPage);
            return lastPage.cursor;
        },
    });

    const tokenPrices = (tokenDbResponses || []).map(response => response.tokens);

    return { tokenPrices: flatten(tokenPrices), isLoading, fetchMoreTokens, isFetchingTokens, isFetchingMoreTokens };
};
