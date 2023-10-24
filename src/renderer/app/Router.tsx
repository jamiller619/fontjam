import {
  RouteObject,
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom'
import { AddItem } from '~/pages/add'
import { Family } from '~/pages/family'
import { Home } from '~/pages/home'
import Layout from './Layout'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Home />,
        children: [
          {
            path: '/family/:name',
            element: <Family />,
          },
          {
            path: '/add/:type',
            element: <AddItem />,
          },
        ],
      },
    ],
  },
]

const router = createBrowserRouter(routes)

export default function Router() {
  return <RouterProvider router={router} />
}
