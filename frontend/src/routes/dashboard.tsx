import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuthStore } from '@/store/auth-store'
import UserDashboard from '@/features/dashboard/components/UserDashboard'
import AdminDashboard from '@/features/dashboard/components/AdminDashboard'

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  )
}

function DashboardPage() {
  const role = useAuthStore((s) => s.user?.role)
  return role === 'ADMIN' ? <AdminDashboard /> : <UserDashboard />
}
