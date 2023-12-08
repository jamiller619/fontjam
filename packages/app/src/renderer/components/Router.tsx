import { useEffect } from 'react'
import {
  RouteObject,
  RouterProvider,
  createBrowserRouter,
  useNavigate,
  useParams,
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

const LibraryRouter = () => {
  const { id } = useParams()

  return <Library id={Number(id)} />
}

const FamilyRouter = () => {
  const { id } = useParams()

  return <Family id={Number(id)} />
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
        element: <LibraryRouter />,
        children: [
          {
            path: 'add/collection',
            element: <AddItem type="collection" />,
          },
        ],
      },
      {
        path: '/family/:id',
        element: <FamilyRouter />,
      },
    ],
  },
]

const router = createBrowserRouter(routes)

export default function Router() {
  return <RouterProvider router={router} />
}
