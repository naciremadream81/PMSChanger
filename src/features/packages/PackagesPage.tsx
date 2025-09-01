import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { formatDate, getStatusColor, getStatusLabel, getPermitTypeLabel } from '@/lib/utils'
import { SearchFilters } from '@/types'

export function PackagesPage() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<SearchFilters>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const { data: packages, isLoading } = useQuery({
    queryKey: ['packages', page, filters],
    queryFn: () => api.getPackages(filters, page, 20),
  })

  const { data: counties } = useQuery({
    queryKey: ['counties'],
    queryFn: () => api.getCounties(),
  })

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, q: searchQuery }))
    setPage(1)
  }

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status?.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...(prev.status || []), status]
    }))
    setPage(1)
  }

  const handleCountyFilter = (countyId: number) => {
    setFilters(prev => ({
      ...prev,
      countyId: prev.countyId === countyId ? undefined : countyId
    }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({})
    setSearchQuery('')
    setPage(1)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Permit Packages</h1>
          <p className="text-gray-600">Manage and track permit packages across Florida counties</p>
        </div>
        <Link
          to="/packages/create"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Package
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search packages, customers, or contractors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="input pl-10"
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <button
            onClick={handleSearch}
            className="btn-primary"
          >
            Search
          </button>
        </div>

        {showFilters && (
          <div className="mt-6 space-y-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {['DRAFT', 'IN_REVIEW', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CLOSED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusFilter(status)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      filters.status?.includes(status)
                        ? 'bg-primary-100 text-primary-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {getStatusLabel(status)}
                  </button>
                ))}
              </div>
            </div>

            {/* County Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                County
              </label>
              <select
                value={filters.countyId || ''}
                onChange={(e) => handleCountyFilter(Number(e.target.value))}
                className="input max-w-xs"
              >
                <option value="">All Counties</option>
                {counties?.map((county) => (
                  <option key={county.id} value={county.id}>
                    {county.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Packages ({packages?.total || 0})
            </h3>
            {Object.keys(filters).length > 0 && (
              <span className="text-sm text-gray-500">
                Filtered results
              </span>
            )}
          </div>
        </div>

        <div className="overflow-hidden">
          {packages?.items && packages.items.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {packages.items.map((pkg) => (
                <div key={pkg.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <Link
                          to={`/packages/${pkg.id}`}
                          className="text-lg font-medium text-primary-600 hover:text-primary-500 truncate"
                        >
                          {pkg.title}
                        </Link>
                        <span className={getStatusColor(pkg.status)}>
                          {getStatusLabel(pkg.status)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span>Customer: {pkg.customer.name}</span>
                        <span>Contractor: {pkg.contractor.companyName}</span>
                        <span>County: {pkg.county.name}</span>
                        <span>Type: {getPermitTypeLabel(pkg.permitType)}</span>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        Created: {formatDate(pkg.createdAt)}
                        {pkg.dueDate && (
                          <span className="ml-4">
                            Due: {formatDate(pkg.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/packages/${pkg.id}`}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/packages/${pkg.id}/edit`}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Edit package"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500">No packages found</p>
              {Object.keys(filters).length > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-2 text-sm text-primary-600 hover:text-primary-500"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {packages && packages.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, packages.total)} of {packages.total} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-700">
                  Page {page} of {packages.totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === packages.totalPages}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
