import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import Login from '../pages/Login'
import Catalog from '../pages/Catalog'
import Orders from '../pages/Orders'
import AdminBooks from '../pages/AdminBooks'
import AdminOrders from '../pages/AdminOrders'
import AdminReminders from '../pages/AdminReminders'
import { RequireAuth } from './RequireAuth'

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <Catalog /> },
            { path: 'login', element: <Login /> },
            { path: 'catalog', element: <Catalog /> },
            {
                path: 'orders',
                element: (
                    <RequireAuth>
                        <Orders />
                    </RequireAuth>
                ),
            },
            {
                path: 'admin/books',
                element: (
                    <RequireAuth roles={['ADMIN']}>
                        <AdminBooks />
                    </RequireAuth>
                ),
            },
            {
                path: 'admin/orders',
                element: (
                    <RequireAuth roles={['ADMIN']}>
                        <AdminOrders />
                    </RequireAuth>
                ),
            },
            {
                path: 'admin/reminders',
                element: (
                    <RequireAuth roles={['ADMIN']}>
                        <AdminReminders />
                    </RequireAuth>
                ),
            },
        ],
    },
])