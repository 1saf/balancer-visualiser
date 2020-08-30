import bent from 'bent';
import { useQuery, QueryKey, QueryConfig } from 'react-query';

const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer';

const subgraphPOST = (literal: string) => async (key: string, variables: Record<string, any>) => {
    const request = bent(SUBGRAPH_URL, 'POST', 'json', [200, 400, 404, 401, 500, 503]);
    return request('', { query: literal, variables });
}

export const useGraphQuery = <TResult = unknown, TError = unknown>(queryKey: QueryKey, literal: string, queryConfig?: QueryConfig<TResult, TError>) => {
    return useQuery(queryKey, subgraphPOST(literal), queryConfig);
};
