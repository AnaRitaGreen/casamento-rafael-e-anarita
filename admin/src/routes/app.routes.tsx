import { type IRoute } from '@/routes'
import { DefaultLayout } from '@/layouts/DefaultLayout'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { Guests } from '@/pages/Guests'
import { Groups } from '@/pages/Groups'
import { Messages } from '@/pages/Messages'
import { Gifts } from '@/pages/Gifts'
import { Tables } from '@/pages/Tables'
import { Settings } from '@/pages/Settings'
import { CheckIn } from '@/pages/CheckIn'

export const appRoutes = [
  {
    path: '/',
    component: <DefaultLayout />,
    routes: [
      {
        path: '/',
        component: <Dashboard />,
        name: 'Dashboard',
      },
      {
        path: '/recepcao',
        component: <CheckIn />,
        name: 'Recepção / Check-in',
      },
      {
        path: '/convidados',
        component: <Guests />,
        name: 'Convidados',
      },
      {
        path: '/grupos',
        component: <Groups />,
        name: 'Grupos',
      },
      {
        path: '/mensagens',
        component: <Messages />,
        name: 'Mensagens',
      },
      {
        path: '/presentes',
        component: <Gifts />,
        name: 'Presentes',
      },
      {
        path: '/mesas',
        component: <Tables />,
        name: 'Mesas',
      },
      {
        path: '/configuracoes',
        component: <Settings />,
        name: 'Configurações',
      },
    ],
  },
  {
    path: '/login',
    component: <Login />,
    name: 'Login',
  },
] as IRoute[]