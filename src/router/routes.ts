import Dashboard from '../routes/dashboard/Dashboard';
import DashboardItem from '../routes/dashboard/DashboardItem';
import PoolsView from '../routes/pools/PoolsView';
import TokensView from '../routes/tokens/TokensView';

export default [
    {
        name: 'home',
        path: '/',
        component: Dashboard,
        children: [
        ],
    },
    {
        name: 'tokens',
        path: '/tokens',
        component: TokensView,
        children: [
        ],
    },
    {
        name: 'pools',
        path: '/pools',
        component: PoolsView,
        children: [
        ],
    }
];