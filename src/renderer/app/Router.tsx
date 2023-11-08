import { useEffect } from 'react'
import {
  RouteObject,
  RouterProvider,
  createBrowserRouter,
  useNavigate,
} from 'react-router-dom'
import { Layout } from '~/components/layout'
import { AddItem } from '~/pages/add'
import { Catalog } from '~/pages/catalog'
import { Family } from '~/pages/family'

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
        element: <Catalog />,
        children: [
          {
            path: 'family/:name',
            element: <Family />,
          },
          {
            path: 'add/library',
            element: <AddItem type="library" />,
          },
          {
            path: 'add/collection',
            element: <AddItem type="collection" />,
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
