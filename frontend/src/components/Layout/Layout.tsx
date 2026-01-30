import React from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'

interface LayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
}

const Layout: React.FC<LayoutProps> = ({ children, showSidebar = true }) => {
  return (
    <div className="app-layout">
      <Header />
      <div className="layout-content">
        {showSidebar && (
          <aside className="sidebar">
            <Sidebar />
          </aside>
        )}
        <main className={`main-content ${showSidebar ? 'with-sidebar' : 'full-width'}`}>
          <div className="container">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default Layout