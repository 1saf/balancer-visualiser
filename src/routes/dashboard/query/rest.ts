import bent from 'bent';
import { HistoricalCGMarketChart } from '../../../api/datatypes';

export const getBalancerPrice = async (key: string) => {
    const request = await bent('GET', 'json', [200, 400, 503, 500]);
    return request('https://api.coingecko.com/api/v3/coins/balancer');
};

export const getHistoricalBalancerPrice = async (key: string, { from, to }: { from: number, to: number }) => {
    const request = await bent('GET', 'json', [200, 400, 503, 500]);
    return request(`https://api.coingecko.com/api/v3/coins/balancer/market_chart/range?vs_currency=usd&from=${from}&to=${to}`) as Promise<HistoricalCGMarketChart>;
};