import { GraphQLResponse } from "./graphql";

export type BalancerData = {
    finalizedPoolCount: number;
    poolCount: number;
    totalLiquidity: number;
    totalSwapFee: number;
    totalSwapVolume: number;
    timestamp?: number;
}

export type BalancerResponse = GraphQLResponse<{
    balancer: BalancerData;
}>;

export type TimeType = 'hour' | 'days' | 'months' | 'years';
export type TimePeriod = {
    value: 'hour' | 'day' | string,
    units?: number,
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

export type Change24H = {
    today: number;
    yesterday: number;
    change: number;
}

export type DynamicChange = {
    data: number[];
    changes: number;
}

export type BalancerState = {
    isLoading: boolean;
    balancerPrice: number;
    privatePools: number;
} & BalancerData;

export type Option = {
    value: string;
    label: string;
}

export type Period = 'max' | '90d' | '30d' | '7d' | '24h' | '2d' | '14d' | '60d';

export type DataType = 'currency' | 'number';