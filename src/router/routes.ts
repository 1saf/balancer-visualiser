import Dashboard from '../routes/dashboard/Dashboard';
import DashboardItem from '../routes/dashboard/DashboardItem';

export default [
    {
        name: 'dashboard',
        path: '/dashboard',
        component: Dashboard,
        children: [
            {
                name: 'id',
                path: '/:id',
                component: DashboardItem,
            },
        ],
    }
];