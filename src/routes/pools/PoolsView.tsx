import React, { Fragment, useMemo } from 'react';
import Table, { StyledSkeletonCell } from '../../components/design/table/Table';
import Stack from '../../components/layout/stack/Stack';
import Text from '../../components/design/text/Text';
import { usePoolsViewState } from './state/hooks';

import numeral from 'numeral';
import styled from 'styled-components';
import { StyledTokenIcon, TokenIconGroup } from '../../components/ui/token_icon/TokenIcon';
import Web3Utils from 'web3-utils';
import { SkeletonText } from '../../components/design/skeleton/Skeleton';
import Feedback from '../../components/design/feedback/Feedback';
import Box from '../../components/layout/box/Box';

type Props = {};

const StyledPoolsView = styled(Stack)`
    padding: 0 1rem;
    padding-bottom: 0.5rem;

    @media (min-width: 1024px) {
        padding: 0;
        padding-bottom: 1rem;
        justify-content: center;
        width: 1164px;
        margin: 0 auto;
        max-width: 1164px;
    }
`;

const SkeletonRow = () => {
    return (
        <Stack orientation='horizontal' width='100%'>
            <StyledSkeletonCell width={200} grow={true}>
                <Stack gap='small'>
                    <SkeletonText height='0.85rem' width='75%' />
                    <SkeletonText height='0.85rem' width='15%' />
                </Stack>
            </StyledSkeletonCell>
            <StyledSkeletonCell width={150}>
                <SkeletonText height='0.85rem' width='35%' float='right' />
            </StyledSkeletonCell>

            <StyledSkeletonCell width={150}>
                <SkeletonText height='0.85rem' width='35%' float='right' />
            </StyledSkeletonCell>
        </Stack>
    );
};

export const PoolsView = (props: Props) => {
    const { setTableState, poolsData, isLoading } = usePoolsViewState();

    const columns = useMemo(
        () => [
            {
                Header: 'Pool',
                accessor: (row: any) => row?.tokens,
                Cell: ({ value }: any) => (
                    <Stack orientation='horizontal' align='center' gap='small'>
                        <TokenIconGroup>
                            {value.map((token: any) => (
                                <StyledTokenIcon key={token?.address}>
                                    <img
                                        src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${Web3Utils.toChecksumAddress(
                                            token?.address
                                        )}/logo.png`}
                                    />
                                </StyledTokenIcon>
                            ))}
                        </TokenIconGroup>
                        <Stack orientation='horizontal' gap='small'>
                            {value.map((token: any, i: number) => (
                                <Fragment>
                                    <Text align='center' weight='medium' size='0.85rem'>
                                        {numeral(token?.denormWeight).value() * 2}% {token?.symbol}
                                    </Text>
                                    {i !== value.length - 1 && <Text size='0.85rem'>{'/'}</Text>}
                                </Fragment>
                            ))}
                        </Stack>
                    </Stack>
                ),
                style: {
                    flexGrow: 1,
                    minWidth: '500px',
                },
                isSearchable: true,
            },
            {
                Header: 'Total Fee Volume',
                accessor: 'totalSwapFee',
                isNumerical: true,
                Cell: ({ value }: any) => <Text size='0.85rem'>{numeral(value).format('$0,0')}</Text>,
                style: {
                    minWidth: '200px',
                },
            },
            {
                Header: 'Total Swap Volume',
                accessor: 'totalSwapVolume',
                isNumerical: true,
                Cell: ({ value }: any) => <Text size='0.85rem'>{numeral(value).format('$0,0')}</Text>,
                style: {
                    minWidth: '200px',
                },
            },
        ],
        [isLoading]
    );

    return (
        <StyledPoolsView gap='base'>
            <Box marginY='base'>
                <Feedback emotion='negative'>
                    Please note that this page is incomplete. Currently only basic tabular features work such as sorting and scrolling
                    through all Pools. Also note that the UI may also be jarring and this is definitely due to be polished soon.
                </Feedback>
            </Box>
            <Table
                setTableState={setTableState}
                isLoading={false}
                skeletonHeight={75}
                columns={columns}
                data={poolsData as any}
                loadingElement={<SkeletonRow />}
                initialState={{
                    sortBy: [
                        {
                            id: 'totalSwapVolume',
                            desc: true,
                        },
                    ],
                }}
            ></Table>
        </StyledPoolsView>
    );
};

export default PoolsView;
