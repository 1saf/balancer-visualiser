import bent from 'bent';
import { useQuery, QueryKey, QueryConfig } from 'react-query';

export const BALANCER_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-beta';
export const ETH_BLOCKS_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks';

export const subgraphPOST = (subGraphURL: string) => (literal: string, loop?: boolean) => async (
    key: string,
    variables: Record<string, any>
) => {
    const request = bent(subGraphURL, 'POST', 'json', [200, 400, 404, 401, 500, 503]);
    if (loop) {
        return Promise.all(
            (variables?.requests || []).map((variables: Record<string, unknown>) => {
                return request('', { query: literal, variables });
            })
        );
    }
    return request('', { query: literal, variables });
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
    const request = subgraphPOST(endpoint)(literal, queryConfig?.loop);

    return useQuery(queryKey, request, queryConfig);
};
