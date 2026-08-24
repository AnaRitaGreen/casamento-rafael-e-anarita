import { type ReactElement } from 'react'
import { Routes, Route } from 'react-router-dom'

import { appRoutes } from './app.routes'

export interface IRoute {
  path: string
  component: ReactElement
  name?: string
  routes?: IRoute[]
}

export function Router() {
  return (
    <Routes>
      {appRoutes.map((route) =>
        !Array.isArray(route.routes) ? (
          <Route
            key={route.path}
            path={route.path}
            element={route.component}
          />
        ) : (
          <Route key={route.path} path={route.path} element={route.component}>
            {route.routes.map((subRoute) => (
              <Route
                key={subRoute.path}
                path={subRoute.path}
                element={subRoute.component}
              />
            ))}
          </Route>
        ),
      )}
    </Routes>
  )
}