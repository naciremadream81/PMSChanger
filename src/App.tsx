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
    // Add error handling for development when backend is not available
    onError: (error) => {
      console.warn('Backend server not available:', error.message)
    }
  })

  // Check if we're in development mode without API
  const isDevMode = import.meta.env.DEV && !import.meta.env.VITE_API_URL;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Handle backend connection errors gracefully
  if (error && !isDevMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-warning-100 mb-4">
              <svg className="h-6 w-6 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Backend Server Unavailable
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              The backend server is not running. Please start the backend server or check your connection.
            </p>
            <div className="space-y-2 text-xs text-gray-400">
              <p>Expected API URL: {import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}</p>
              <p>Error: {error.message}</p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 btn-primary"
            >
              Retry Connection
            </button>
          </div>
        </div>
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
