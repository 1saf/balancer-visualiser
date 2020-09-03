import bent from 'bent';
import { useQuery, QueryKey, QueryConfig } from 'react-query';

export const BALANCER_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-beta';
export const ETH_BLOCKS_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks';
export type GraphQLResponse<T> = { data: T };

export const subgraphPOST = <TResult>(subGraphURL: string) => (literal: string, loop?: boolean) => async (
    key: string,
    variables: Record<string, any>
): Promise<TResult> => {
    const request = bent(subGraphURL, 'POST', 'json', [200, 400, 404, 401, 500, 503]);
    if (loop) {
        return (Promise.all(
            (variables?.requests || []).map((variables: Record<string, unknown>) => {
                return request('', { query: literal, variables });
            })
            // need to cast as unknown first, need to tell typescript that we know
            // what we are doing if we provide a type to this function
        ) as unknown) as TResult;
    }
    // need to cast as unknown first, need to tell typescript that we know
    // what we are doing if we provide a type to this function
    return (request('', { query: literal, variables }) as unknown) as TResult;
};

type CustomQueryConfig = {
    loop?: boolean;
    graphEndpoint?: string;
};

export const useGraphQuery = <TResult = unknown, TError = unknown>(
    queryKey: QueryKey,
    literal: string,
    queryConfig?: QueryConfig<TResult, TError> & CustomQueryConfig
) => {
    const endpoint = queryConfig?.graphEndpoint || BALANCER_SUBGRAPH_URL;
    const request = subgraphPOST<TResult>(endpoint)(literal, queryConfig?.loop);

    return useQuery(queryKey, request, queryConfig);
};
