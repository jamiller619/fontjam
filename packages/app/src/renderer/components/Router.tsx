import { useEffect } from 'react'
import {
  RouteObject,
  RouterProvider,
  createBrowserRouter,
  useNavigate,
} from 'react-router-dom'
import { AddItem } from '~/pages/add'
import { Family } from '~/pages/family'
import { Library } from '~/pages/library'
import Layout from './layout/Layout'

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
            path: 'add/library',
            element: <AddItem type="local" />,
          },
          {
            path: 'add/remote',
            element: <AddItem type="remote" />,
          },
          {
            path: 'add/collection',
            element: <AddItem type="collection" />,
          },
        ],
      },
      {
        path: '/family/:libraryId/:name',
        element: <Family />,
      },
    ],
  },
]

const router = createBrowserRouter(routes)

export default function Router() {
  return <RouterProvider router={router} />
}
