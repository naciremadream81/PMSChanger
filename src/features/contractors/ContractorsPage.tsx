import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Edit,
  Building2,
  Phone,
  Mail,
  User
} from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { formatDate } from '@/lib/utils'

export function ContractorsPage() {
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')

  const { data: contractors, isLoading } = useQuery({
    queryKey: ['contractors', page, searchQuery],
    queryFn: () => api.getContractors(page, 20),
  })

  const handleSearch = () => {
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
          <h1 className="text-2xl font-bold text-gray-900">Contractors</h1>
          <p className="text-gray-600">Manage contractor information</p>
        </div>
        <Link
          to="/contractors/create"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Contractor
        </Link>
      </div>

      {/* Search */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search contractors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="input pl-10"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="btn-primary"
          >
            Search
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Contractors ({contractors?.total || 0})
          </h3>
        </div>

        <div className="overflow-hidden">
          {contractors?.items && contractors.items.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {contractors.items.map((contractor) => (
                <div key={contractor.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <Building2 className="h-5 w-5 text-gray-400" />
                        <Link
                          to={`/contractors/${contractor.id}`}
                          className="text-lg font-medium text-primary-600 hover:text-primary-500 truncate"
                        >
                          {contractor.companyName}
                        </Link>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        {contractor.contactName && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {contractor.contactName}
                          </span>
                        )}
                        {contractor.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {contractor.phone}
                          </span>
                        )}
                        {contractor.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {contractor.email}
                          </span>
                        )}
                      </div>
                      {contractor.licenseNumber && (
                        <div className="mt-1 text-sm text-gray-500">
                          License: {contractor.licenseNumber}
                        </div>
                      )}
                      {contractor.address && (
                        <div className="mt-1 text-sm text-gray-500">
                          {contractor.address.line1}, {contractor.address.city}, {contractor.address.state} {contractor.address.zip}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/contractors/${contractor.id}`}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/contractors/${contractor.id}/edit`}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Edit contractor"
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
              <p className="text-gray-500">No contractors found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {contractors && contractors.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, contractors.total)} of {contractors.total} results
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
                  Page {page} of {contractors.totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === contractors.totalPages}
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
