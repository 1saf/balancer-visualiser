import bent from 'bent';
import { useQuery, QueryKey, QueryConfig, useInfiniteQuery, InfiniteQueryConfig } from 'react-query';
import { spawn } from '../threads';
import { print } from 'graphql';
import { from } from 'rxjs';
import { bufferCount, map, toArray } from 'rxjs/operators';

export const BALANCER_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer';
export const ETH_BLOCKS_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks';
export type EthBlockResponse = { id: string; number: string; timestamp: string };
export type EthBlocksResponse = GraphQLResponse<Record<string, EthBlockResponse[]>>[];
export type GraphQLResponse<T> = { data: T };

export const subgraphPOST = <TResult>(subGraphURL: string) => (literal: string, loop?: boolean) => async (
    key: string,
    variables: Record<string, any>,
    extraData?: Record<string, unknown>,
): Promise<TResult> => {
    const request = bent(subGraphURL, 'POST', 'json', [200, 400, 404, 401, 500, 503]);
    if (loop) {
        const promises = from(variables?.requests)
            .pipe(
                bufferCount(325),
                map(async requests => {
                    const worker = spawn(new Worker('./batchedquerybuilder.js'));
                    const queryBuilderResult: any = await worker(literal, requests);
                    const response = await request('', {
                        query: print(queryBuilderResult?.document),
                        variables: queryBuilderResult?.variables,
                    });
                    return response;
                }),
                toArray()
            )
            .toPromise();

        const responses = await Promise.all(await promises);
        const result = responses.map((r: any) => r?.data);
        return (result as unknown) as TResult;
    }
    // need to cast as unknown first, need to tell typescript that we know
    // what we are doing if we provide a type to this function
    return (request('', { query: literal, variables: { ...variables, ...extraData } }) as unknown) as TResult;
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

export const useInfiniteGraphQuery = <TResult = unknown, TError = unknown>(
    queryKey: QueryKey,
    literal: string,
    queryConfig?: InfiniteQueryConfig<TResult, TError> & CustomQueryConfig,
) => {
    const endpoint = queryConfig?.graphEndpoint || BALANCER_SUBGRAPH_URL;
    const request = subgraphPOST<TResult>(endpoint)(literal, queryConfig?.loop);

    return useInfiniteQuery(queryKey, request, queryConfig);
};
