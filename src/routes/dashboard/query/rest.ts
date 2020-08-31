import bent from 'bent';

export const getBalancerPrice = async (key: string) => {
    const request = await bent('GET', 'json', [200, 400, 503, 500]);
    return request('https://api.coingecko.com/api/v3/coins/balancer');
};
