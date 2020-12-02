import React, { FC } from 'react';
import Table from '../../components/design/table/Table';
import Box from '../../components/layout/box/Box';
import Grid from '../../components/layout/grid/Grid';
import { useTokensViewState } from './state/hooks';

import numeral from 'numeral';
import Stack from '../../components/layout/stack/Stack';
import styled from 'styled-components';
import { tokens } from '../../style/Theme';
type Props = {};

const StyledTokenSymbol = styled.span`
    display: inline-block;
    color: ${tokens.colors.blue400};
`;

const columns = [
    {
        Header: 'Token',
        accessor: 'name', // accessor is the "key" in the data
        Cell: ({ row, value }: any) => <Stack gap='small'>
            <span>{String(value)}</span>
            <StyledTokenSymbol>{String(row?.original?.symbol)}</StyledTokenSymbol>
        </Stack>
    },
    {
        Header: 'Price',
        accessor: 'price',
        isNumerical: true,
        Cell: ({ value }: any) => numeral(value).format('$0.00a')
    },
    {
        Header: 'Total Liquidity',
        accessor: 'poolLiquidity',
        isNumerical: true,
        Cell: ({ value }: any) => numeral(value).format('$0.00a')
    },
];

const TokensView: FC<Props> = props => {
    const {} = props;

    const { tokenPrices } = useTokensViewState();
    if (!tokenPrices) return null;
    return (
        <Grid width='100%' paddingY='large' paddingX={['base', 'base', 'base', 'none']}>
            <Box spanX={12}>

            <Table columns={columns} data={tokenPrices}></Table>
            </Box>
        </Grid>
    );
};

export default TokensView;
