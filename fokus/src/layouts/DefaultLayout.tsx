import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'

export function DefaultLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2.5rem 3rem', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}