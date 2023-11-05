import { useEffect } from 'react'
import {
  RouteObject,
  RouterProvider,
  createBrowserRouter,
  useNavigate,
} from 'react-router-dom'
import { AddItem } from '~/pages/add'
import { Family } from '~/pages/family'
import { Home } from '~/pages/home'
import { Library } from '~/pages/library'
import Layout from './Layout'

const HomeRouter = () => {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/library/1')
  }, [navigate])

  return null
}

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <HomeRouter />,
      },
      {
        path: '/library/:id',
        element: <Library />,
        children: [
          {
            path: '/library/:id/family/:name',
            element: <Family />,
          },
        ],
      },
      // {
      //   path: '/',
      //   element: <Home />,
      //   children: [
      //     {
      //       path: '/family/:name',
      //       element: <Family />,
      //     },
      //     {
      //       path: '/add/:type',
      //       element: <AddItem />,
      //     },
      //   ],
      // },
    ],
  },
]

const router = createBrowserRouter(routes)

export default function Router() {
  return <RouterProvider router={router} />
}
