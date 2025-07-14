import { useEffect } from 'react'
import {
  RouteObject,
  RouterProvider,
  createBrowserRouter,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { AddItem } from '~/screens/add'
import { Family } from '~/screens/family'
import { Library } from '~/screens/library'
import { useStore } from '~/store'
import Layout from './layout/Layout'

function HomeRouter() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/library/1')
  }, [navigate])

  return null
}

function LibraryRouter() {
  const { id } = useParams()
  const setActiveLibrary = useStore((state) => state.setActiveLibrary)

  useEffect(() => {
    setActiveLibrary(Number(id))
  }, [id, setActiveLibrary])

  return <Library id={Number(id)} />
}

function FamilyRouter() {
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
