import React, { type ReactNode } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface GenePageLayoutProps {
  children: ReactNode
}

const GenePageLayout: React.FC<GenePageLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen  flex flex-col w-full">
      <Header />
      <main className="flex- pt-24">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default GenePageLayout