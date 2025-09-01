import { Routes, Route, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Layout } from '@/components/Layout'
import { LoginPage } from '@/features/auth/LoginPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { PackagesPage } from '@/features/packages/PackagesPage'
import { PackageDetailPage } from '@/features/packages/PackageDetailPage'
import { CreatePackagePage } from '@/features/packages/CreatePackagePage'
import { CustomersPage } from '@/features/customers/CustomersPage'
import { CreateCustomerPage } from '@/features/customers/CreateCustomerPage'
import { CustomerDetailPage } from '@/features/customers/CustomerDetailPage'
import { ContractorsPage } from '@/features/contractors/ContractorsPage'
import { CreateContractorPage } from '@/features/contractors/CreateContractorPage'
import { ContractorDetailPage } from '@/features/contractors/ContractorDetailPage'
import { AdminPage } from '@/features/admin/AdminPage'
import { CountiesPage } from '@/features/admin/CountiesPage'
import { LoadingSpinner } from '@/components/LoadingSpinner'

function App() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.getCurrentUser(),
    retry: false,
    staleTime: Infinity,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // If no user is authenticated, show login page
  if (!user?.data) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // Authenticated routes
  return (
    <Layout user={user.data}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/packages/create" element={<CreatePackagePage />} />
        <Route path="/packages/:id" element={<PackageDetailPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/customers/create" element={<CreateCustomerPage />} />
        <Route path="/customers/:id" element={<CustomerDetailPage />} />
        <Route path="/contractors" element={<ContractorsPage />} />
        <Route path="/contractors/create" element={<CreateContractorPage />} />
        <Route path="/contractors/:id" element={<ContractorDetailPage />} />
        {user.data.role === 'ADMIN' && (
          <>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/counties" element={<CountiesPage />} />
          </>
        )}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
