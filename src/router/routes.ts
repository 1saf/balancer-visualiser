import Dashboard from '../routes/dashboard/Dashboard';
import DashboardItem from '../routes/dashboard/DashboardItem';

export default [
    {
        name: 'home',
        path: '/',
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