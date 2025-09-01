import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Building2, 
  Phone, 
  Mail, 
  Calendar,
  DollarSign,
  User,
  MapPin
} from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { 
  formatDate, 
  getSubcontractorStatusColor, 
  getSubcontractorStatusLabel,
  formatCurrency,
  TRADE_TYPES
} from '@/lib/utils'
import { Subcontractor, CreateSubcontractorFormData } from '@/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'

const subcontractorSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  licenseNumber: z.string().optional(),
  tradeType: z.string().min(1, 'Trade type is required'),
  scopeOfWork: z.string().optional(),
  contractAmount: z.number().optional(),
  startDate: z.string().optional(),
  completionDate: z.string().optional(),
  address: z.object({
    line1: z.string().min(1, 'Address line 1 is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().length(2, 'State must be 2 characters'),
    zip: z.string().min(1, 'ZIP code is required'),
  }).optional(),
})

type FormData = z.infer<typeof subcontractorSchema>

interface SubcontractorManagerProps {
  packageId: string
}

export function SubcontractorManager({ packageId }: SubcontractorManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingSubcontractor, setEditingSubcontractor] = useState<Subcontractor | null>(null)
  const queryClient = useQueryClient()

  const { data: subcontractors, isLoading } = useQuery({
    queryKey: ['subcontractors', packageId],
    queryFn: () => api.getPackageSubcontractors(packageId),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(subcontractorSchema),
    defaultValues: {
      address: {
        state: 'FL',
      },
    },
  })

  const createSubcontractorMutation = useMutation({
    mutationFn: (data: FormData) => api.createSubcontractor(packageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcontractors', packageId] })
      reset()
      setShowForm(false)
    },
  })

  const updateSubcontractorMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FormData> }) =>
      api.updateSubcontractor(packageId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcontractors', packageId] })
      reset()
      setEditingSubcontractor(null)
      setShowForm(false)
    },
  })

  const deleteSubcontractorMutation = useMutation({
    mutationFn: (id: string) => api.deleteSubcontractor(packageId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcontractors', packageId] })
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.updateSubcontractorStatus(packageId, id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcontractors', packageId] })
    },
  })

  const onSubmit = (data: FormData) => {
    if (editingSubcontractor) {
      updateSubcontractorMutation.mutate({ id: editingSubcontractor.id, data })
    } else {
      createSubcontractorMutation.mutate(data)
    }
  }

  const handleEdit = (subcontractor: Subcontractor) => {
    setEditingSubcontractor(subcontractor)
    reset({
      companyName: subcontractor.companyName,
      contactName: subcontractor.contactName || '',
      phone: subcontractor.phone || '',
      email: subcontractor.email || '',
      licenseNumber: subcontractor.licenseNumber || '',
      tradeType: subcontractor.tradeType,
      scopeOfWork: subcontractor.scopeOfWork || '',
      contractAmount: subcontractor.contractAmount,
      startDate: subcontractor.startDate || '',
      completionDate: subcontractor.completionDate || '',
      address: subcontractor.address ? {
        line1: subcontractor.address.line1,
        line2: subcontractor.address.line2 || '',
        city: subcontractor.address.city,
        state: subcontractor.address.state,
        zip: subcontractor.address.zip,
      } : undefined,
    })
    setShowForm(true)
  }

  const handleCancel = () => {
    reset()
    setEditingSubcontractor(null)
    setShowForm(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Subcontractors</h3>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Subcontractor
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            {editingSubcontractor ? 'Edit Subcontractor' : 'Add New Subcontractor'}
          </h4>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  {...register('companyName')}
                  className={cn('input', errors.companyName && 'border-danger-300')}
                  placeholder="Enter company name"
                />
                {errors.companyName && (
                  <p className="mt-1 text-sm text-danger-600">{errors.companyName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trade Type *
                </label>
                <select
                  {...register('tradeType')}
                  className={cn('input', errors.tradeType && 'border-danger-300')}
                >
                  <option value="">Select trade type</option>
                  {TRADE_TYPES.map((trade) => (
                    <option key={trade} value={trade}>
                      {trade}
                    </option>
                  ))}
                </select>
                {errors.tradeType && (
                  <p className="mt-1 text-sm text-danger-600">{errors.tradeType.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person
                </label>
                <input
                  {...register('contactName')}
                  className="input"
                  placeholder="Enter contact person name"
                />
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

              <div>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Number
                </label>
                <input
                  {...register('licenseNumber')}
                  className="input"
                  placeholder="Enter license number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contract Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('contractAmount', { valueAsNumber: true })}
                  className="input"
                  placeholder="Enter contract amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  {...register('startDate')}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Completion Date
                </label>
                <input
                  type="date"
                  {...register('completionDate')}
                  className="input"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scope of Work
                </label>
                <textarea
                  {...register('scopeOfWork')}
                  rows={3}
                  className="input"
                  placeholder="Describe the scope of work"
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="border-t pt-6">
              <h5 className="text-md font-medium text-gray-900 mb-4">Address (Optional)</h5>
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
                    placeholder="Suite, unit, etc. (optional)"
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

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createSubcontractorMutation.isPending || updateSubcontractorMutation.isPending}
                className="btn-primary flex items-center gap-2"
              >
                {(createSubcontractorMutation.isPending || updateSubcontractorMutation.isPending) ? (
                  <>
                    <LoadingSpinner size="sm" />
                    {editingSubcontractor ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {editingSubcontractor ? 'Update' : 'Create'} Subcontractor
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subcontractors List */}
      <div className="space-y-4">
        {subcontractors && subcontractors.length > 0 ? (
          subcontractors.map((subcontractor) => (
            <div key={subcontractor.id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <h4 className="text-lg font-medium text-gray-900">
                      {subcontractor.companyName}
                    </h4>
                    <span className={getSubcontractorStatusColor(subcontractor.status)}>
                      {getSubcontractorStatusLabel(subcontractor.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className="font-medium">Trade:</span>
                      <span>{subcontractor.tradeType}</span>
                    </div>
                    
                    {subcontractor.contactName && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{subcontractor.contactName}</span>
                      </div>
                    )}
                    
                    {subcontractor.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{subcontractor.phone}</span>
                      </div>
                    )}
                    
                    {subcontractor.email && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{subcontractor.email}</span>
                      </div>
                    )}
                    
                    {subcontractor.contractAmount && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatCurrency(subcontractor.contractAmount)}</span>
                      </div>
                    )}
                    
                    {subcontractor.startDate && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Start: {formatDate(subcontractor.startDate)}</span>
                      </div>
                    )}
                  </div>
                  
                  {subcontractor.scopeOfWork && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Scope of Work:</span> {subcontractor.scopeOfWork}
                      </p>
                    </div>
                  )}
                  
                  {subcontractor.address && (
                    <div className="flex items-start space-x-2 text-sm text-gray-600 mb-4">
                      <MapPin className="h-4 w-4 mt-0.5" />
                      <div>
                        <p>{subcontractor.address.line1}</p>
                        {subcontractor.address.line2 && <p>{subcontractor.address.line2}</p>}
                        <p>{subcontractor.address.city}, {subcontractor.address.state} {subcontractor.address.zip}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Created: {formatDate(subcontractor.createdAt)}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {/* Status Update */}
                  <select
                    value={subcontractor.status}
                    onChange={(e) => updateStatusMutation.mutate({ 
                      id: subcontractor.id, 
                      status: e.target.value 
                    })}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  
                  <button
                    onClick={() => handleEdit(subcontractor)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Edit subcontractor"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => deleteSubcontractorMutation.mutate(subcontractor.id)}
                    className="p-2 text-gray-400 hover:text-danger-600"
                    title="Delete subcontractor"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card p-6 text-center">
            <p className="text-gray-500">No subcontractors added yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 text-sm text-primary-600 hover:text-primary-500"
            >
              Add your first subcontractor
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
