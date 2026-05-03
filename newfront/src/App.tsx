import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GeneralPages, DashboardPages, StandalonePages } from '@/routes/routes'
import GenePageLayout from '@/layouts/GenePageLayout'
import DashboardLayout from '@/layouts/DashboardLayout'
import AuthGuard from '@/components/AuthGuard'

const NotFound: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center text-center px-4">
    <div>
      <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-base text-gray-600">The page you&apos;re looking for does not exist.</p>
    </div>
  </div>
)

const App: React.FC = () => {
  const renderRoutes = (
    pages: Array<{ path: string; component: React.ComponentType }> ,
    options: { layout?: React.ComponentType<{ children: React.ReactNode }>, auth?: boolean } = {}
  ) =>
    pages.map(({ path, component: Component }) => {
      let element: React.ReactElement = <Component />

      if (options.layout) {
        const Layout = options.layout
        element = <Layout>{element}</Layout>
      }

      if (options.auth) {
        element = <AuthGuard>{element}</AuthGuard>
      }

      return <Route key={path} path={path} element={element} />
    })

  return (
    <BrowserRouter>
      <Routes>
        {renderRoutes(GeneralPages, { layout: GenePageLayout })}
        {renderRoutes(StandalonePages)}
        {renderRoutes(DashboardPages, { layout: DashboardLayout, auth: true })}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
