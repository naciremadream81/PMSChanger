import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { 
  FileText, 
  Users, 
  Building2, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Plus,
  ArrowRight
} from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'

export function DashboardPage() {
  const { data: packages, isLoading: packagesLoading } = useQuery({
    queryKey: ['packages', 'dashboard'],
    queryFn: () => api.getPackages({}, 1, 10),
  })

  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ['customers', 'dashboard'],
    queryFn: () => api.getCustomers(1, 5),
  })

  const { data: contractors, isLoading: contractorsLoading } = useQuery({
    queryKey: ['contractors', 'dashboard'],
    queryFn: () => api.getContractors(1, 5),
  })

  if (packagesLoading || customersLoading || contractorsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const stats = {
    totalPackages: packages?.total || 0,
    pendingPackages: packages?.items?.filter(p => p.status === 'IN_REVIEW').length || 0,
    approvedPackages: packages?.items?.filter(p => p.status === 'APPROVED').length || 0,
    totalCustomers: customers?.total || 0,
    totalContractors: contractors?.total || 0,
  }

  const recentPackages = packages?.items?.slice(0, 5) || []
  const upcomingDeadlines = packages?.items
    ?.filter(p => p.dueDate && new Date(p.dueDate) > new Date())
    ?.sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    ?.slice(0, 3) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your permit management system</p>
        </div>
        <Link
          to="/packages/create"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Package
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Packages</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalPackages}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingPackages}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.approvedPackages}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Customers</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalCustomers}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Packages */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Packages</h3>
          </div>
          <div className="p-6">
            {recentPackages.length > 0 ? (
              <div className="space-y-4">
                {recentPackages.map((pkg) => (
                  <div key={pkg.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/packages/${pkg.id}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-500 truncate block"
                      >
                        {pkg.title}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {pkg.customer.name} • {pkg.county.name}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={getStatusColor(pkg.status)}>
                        {getStatusLabel(pkg.status)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(pkg.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="pt-4">
                  <Link
                    to="/packages"
                    className="text-sm text-primary-600 hover:text-primary-500 flex items-center gap-1"
                  >
                    View all packages
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No packages yet</p>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Deadlines</h3>
          </div>
          <div className="p-6">
            {upcomingDeadlines.length > 0 ? (
              <div className="space-y-4">
                {upcomingDeadlines.map((pkg) => (
                  <div key={pkg.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/packages/${pkg.id}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-500 truncate block"
                      >
                        {pkg.title}
                      </Link>
                      <p className="text-sm text-gray-500">
                        Due: {formatDate(pkg.dueDate!)}
                      </p>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-warning-500" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming deadlines</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/packages/create"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <FileText className="h-6 w-6 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Create Package</p>
              <p className="text-sm text-gray-500">Start a new permit package</p>
            </div>
          </Link>

          <Link
            to="/customers/create"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <Users className="h-6 w-6 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Add Customer</p>
              <p className="text-sm text-gray-500">Create a new customer record</p>
            </div>
          </Link>

          <Link
            to="/contractors/create"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <Building2 className="h-6 w-6 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Add Contractor</p>
              <p className="text-sm text-gray-500">Create a new contractor record</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
