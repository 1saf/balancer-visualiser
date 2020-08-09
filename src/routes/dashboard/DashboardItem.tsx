import React, { FC } from 'react';
import { useRouteNode } from 'react-router5';

const DashboardItem: FC<any> = ({ children }) => {
    const { route } = useRouteNode('dashboard.id');
    return (
        <div>
            This is a Dashboard ITEM!
            { children }
        </div>
    );
}

export default DashboardItem;