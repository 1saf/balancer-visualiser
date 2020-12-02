import { GraphQLResponse, useGraphQuery } from '../../../api/graphql';

import tokensQuery from '../query/tokens.graphql';

type TokenPrice = {
    name: string;
    poolLiquidity: string;
    price: string;
    symbol: string;
};

type TokensQueryResponse = {
    tokenPrices: TokenPrice[];
};

export const useTokensViewState = () => {
    const { data: response, isLoading } = useGraphQuery<GraphQLResponse<TokensQueryResponse>>('tokens', tokensQuery);

    const tokenPrices = response?.data?.tokenPrices;
    return { tokenPrices, isLoading };
};
