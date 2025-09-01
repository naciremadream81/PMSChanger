import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Edit } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { formatDate } from '@/lib/utils'

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => api.getCustomer(id!),
    enabled: !!id,
  })

  if (isLoading || !customer) {
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
        <div className="flex items-center space-x-4">
          <Link
            to="/customers"
            className="text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-gray-600">Customer details</p>
          </div>
        </div>
        <Link
          to={`/customers/${id}/edit`}
          className="btn-secondary flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          Edit
        </Link>
      </div>

      {/* Customer Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-sm text-gray-900">{customer.name}</p>
            </div>
            {customer.phone && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-sm text-gray-900">{customer.phone}</p>
              </div>
            )}
            {customer.email && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{customer.email}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Created</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(customer.createdAt)}</p>
            </div>
          </div>
        </div>

        {customer.address && (
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <p className="mt-1 text-sm text-gray-900">
                  {customer.address.line1}
                  {customer.address.line2 && <br />}
                  {customer.address.line2}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City, State ZIP</label>
                <p className="mt-1 text-sm text-gray-900">
                  {customer.address.city}, {customer.address.state} {customer.address.zip}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Packages */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Permit Packages</h3>
        <p className="text-gray-500">Package list will be implemented here</p>
      </div>
    </div>
  )
}
