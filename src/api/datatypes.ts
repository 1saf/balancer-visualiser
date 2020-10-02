import { GraphQLResponse } from "./graphql";

export type BalancerData = {
    finalizedPoolCount: number;
    poolCount: number;
    totalLiquidity: string;
    totalSwapFee: string;
    totalSwapVolume: string;
}

export type BalancerResponse = GraphQLResponse<{
    balancer: BalancerData;
}>;

export type TimeType = 'hour' | 'days' | 'months' | 'years';
export type TimePeriod = {
    value: 'hourly' | 'daily' | string,
    label: string,
};

export type HistoricalCGMarketChart = {
    market_caps: [number, number][],
    prices: [number, number][],
    total_volumes: [number, number][],
}

export type EthereumBlock = {
    blockNumber: number;
    blockTimestamp: number;
}

export type DataType = 'currency' | 'number';