import Dashboard from '../routes/dashboard/Dashboard';
import DashboardItem from '../routes/dashboard/DashboardItem';
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
    }
];