import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { cn } from '@/lib/utils'

const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  address: z.object({
    line1: z.string().min(1, 'Address line 1 is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().length(2, 'State must be 2 characters'),
    zip: z.string().min(1, 'ZIP code is required'),
  }).optional(),
})

type FormData = z.infer<typeof createCustomerSchema>

export function CreateCustomerPage() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      address: {
        state: 'FL',
      },
    },
  })

  const createCustomerMutation = useMutation({
    mutationFn: (data: FormData) => api.createCustomer(data),
    onSuccess: (customer) => {
      navigate(`/customers/${customer.id}`)
    },
  })

  const onSubmit = (data: FormData) => {
    createCustomerMutation.mutate(data)
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
            <h1 className="text-2xl font-bold text-gray-900">Create New Customer</h1>
            <p className="text-gray-600">Add a new customer to the system</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                {...register('name')}
                className={cn('input', errors.name && 'border-danger-300')}
                placeholder="Enter customer's full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-danger-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                {...register('phone')}
                className="input"
                placeholder="Enter phone number"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                {...register('email')}
                className={cn('input', errors.email && 'border-danger-300')}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-danger-600">{errors.email.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Address (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 1
              </label>
              <input
                {...register('address.line1')}
                className={cn('input', errors.address?.line1 && 'border-danger-300')}
                placeholder="Enter street address"
              />
              {errors.address?.line1 && (
                <p className="mt-1 text-sm text-danger-600">{errors.address.line1.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 2
              </label>
              <input
                {...register('address.line2')}
                className="input"
                placeholder="Apartment, suite, etc. (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                {...register('address.city')}
                className={cn('input', errors.address?.city && 'border-danger-300')}
                placeholder="Enter city"
              />
              {errors.address?.city && (
                <p className="mt-1 text-sm text-danger-600">{errors.address.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                {...register('address.state')}
                className={cn('input', errors.address?.state && 'border-danger-300')}
                placeholder="FL"
                maxLength={2}
              />
              {errors.address?.state && (
                <p className="mt-1 text-sm text-danger-600">{errors.address.state.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code
              </label>
              <input
                {...register('address.zip')}
                className={cn('input', errors.address?.zip && 'border-danger-300')}
                placeholder="Enter ZIP code"
              />
              {errors.address?.zip && (
                <p className="mt-1 text-sm text-danger-600">{errors.address.zip.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Link
            to="/customers"
            className="btn-secondary"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createCustomerMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            {createCustomerMutation.isPending ? (
              <>
                <LoadingSpinner size="sm" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Create Customer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
