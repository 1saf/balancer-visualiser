import React, { Fragment } from 'react';

export default function StatisticSkeleton() {
    return (
        <Fragment>
            <rect x='0' y='0' rx='10' ry='10' width='150' height='16' />
            <rect x='0' y='24' rx='10' ry='10' width='150' height='24' />
            <rect x='0' y='56' rx='10' ry='10' width='100' height='16' />
        </Fragment>
    );
}
