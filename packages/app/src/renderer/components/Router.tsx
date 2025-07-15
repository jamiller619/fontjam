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

  // The key prop is used to force a re-render of the Library component
  // when the id changes, which is necessary for all the
  // state in the component to reset:
  // https://stackoverflow.com/questions/21749798/how-can-i-reset-a-react-component-including-all-transitively-reachable-state/21750576#21750576
  return <Library id={Number(id)} key={new Date().getTime()} />
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
