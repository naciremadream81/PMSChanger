import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { cn } from '@/lib/utils'
import { CreatePackageFormData } from '@/types'

const createPackageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  permitType: z.enum(['RESIDENTIAL', 'MOBILE_HOME', 'MODULAR_HOME']),
  countyId: z.number().min(1, 'County is required'),
  customerId: z.string().min(1, 'Customer is required'),
  contractorId: z.string().min(1, 'Contractor is required'),
  parcelNumber: z.string().optional(),
  floodZone: z.string().optional(),
  windExposure: z.string().optional(),
  zoningApprovalRef: z.string().optional(),
  dueDate: z.string().optional(),
  siteAddress: z.object({
    line1: z.string().min(1, 'Address line 1 is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().length(2, 'State must be 2 characters'),
    zip: z.string().min(1, 'ZIP code is required'),
  }),
  mobileHome: z.object({
    makeModel: z.string().optional(),
    year: z.number().optional(),
    widthFt: z.number().optional(),
    lengthFt: z.number().optional(),
    serialVIN: z.string().optional(),
    hudLabel: z.string().optional(),
    installerLicense: z.string().optional(),
    foundationType: z.string().optional(),
    tieDownSystem: z.string().optional(),
    windZone: z.string().optional(),
  }).optional(),
})

type FormData = z.infer<typeof createPackageSchema>

export function CreatePackagePage() {
  const navigate = useNavigate()
  const [showMobileHomeFields, setShowMobileHomeFields] = useState(false)

  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.getCustomers(1, 1000),
  })

  const { data: contractors, isLoading: contractorsLoading } = useQuery({
    queryKey: ['contractors'],
    queryFn: () => api.getContractors(1, 1000),
  })

  const { data: counties, isLoading: countiesLoading } = useQuery({
    queryKey: ['counties'],
    queryFn: () => api.getCounties(),
  })

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createPackageSchema),
    defaultValues: {
      permitType: 'RESIDENTIAL',
      siteAddress: {
        state: 'FL',
      },
    },
  })

  const permitType = watch('permitType')

  const createPackageMutation = useMutation({
    mutationFn: (data: FormData) => api.createPackage(data),
    onSuccess: (packageData) => {
      // If mobile home details are provided, update them
      if (data.mobileHome && permitType !== 'RESIDENTIAL') {
        api.updateMobileHomeDetails(packageData.id, data.mobileHome)
      }
      navigate(`/packages/${packageData.id}`)
    },
  })

  const onSubmit = (data: FormData) => {
    createPackageMutation.mutate(data)
  }

  if (customersLoading || contractorsLoading || countiesLoading) {
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
            to="/packages"
            className="text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Package</h1>
            <p className="text-gray-600">Create a new permit package</p>
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
                Package Title *
              </label>
              <input
                {...register('title')}
                className={cn('input', errors.title && 'border-danger-300')}
                placeholder="Enter package title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-danger-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permit Type *
              </label>
              <select
                {...register('permitType')}
                className={cn('input', errors.permitType && 'border-danger-300')}
                onChange={(e) => {
                  setShowMobileHomeFields(e.target.value !== 'RESIDENTIAL')
                }}
              >
                <option value="RESIDENTIAL">Residential</option>
                <option value="MOBILE_HOME">Mobile Home</option>
                <option value="MODULAR_HOME">Modular Home</option>
              </select>
              {errors.permitType && (
                <p className="mt-1 text-sm text-danger-600">{errors.permitType.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                County *
              </label>
              <select
                {...register('countyId', { valueAsNumber: true })}
                className={cn('input', errors.countyId && 'border-danger-300')}
              >
                <option value="">Select a county</option>
                {counties?.map((county) => (
                  <option key={county.id} value={county.id}>
                    {county.name}
                  </option>
                ))}
              </select>
              {errors.countyId && (
                <p className="mt-1 text-sm text-danger-600">{errors.countyId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                {...register('dueDate')}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Customer and Contractor */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Customer & Contractor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer *
              </label>
              <select
                {...register('customerId')}
                className={cn('input', errors.customerId && 'border-danger-300')}
              >
                <option value="">Select a customer</option>
                {customers?.items?.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              {errors.customerId && (
                <p className="mt-1 text-sm text-danger-600">{errors.customerId.message}</p>
              )}
              <div className="mt-2">
                <Link
                  to="/customers/create"
                  className="text-sm text-primary-600 hover:text-primary-500 flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add new customer
                </Link>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contractor *
              </label>
              <select
                {...register('contractorId')}
                className={cn('input', errors.contractorId && 'border-danger-300')}
              >
                <option value="">Select a contractor</option>
                {contractors?.items?.map((contractor) => (
                  <option key={contractor.id} value={contractor.id}>
                    {contractor.companyName}
                  </option>
                ))}
              </select>
              {errors.contractorId && (
                <p className="mt-1 text-sm text-danger-600">{errors.contractorId.message}</p>
              )}
              <div className="mt-2">
                <Link
                  to="/contractors/create"
                  className="text-sm text-primary-600 hover:text-primary-500 flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add new contractor
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Site Address */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Site Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 1 *
              </label>
              <input
                {...register('siteAddress.line1')}
                className={cn('input', errors.siteAddress?.line1 && 'border-danger-300')}
                placeholder="Enter street address"
              />
              {errors.siteAddress?.line1 && (
                <p className="mt-1 text-sm text-danger-600">{errors.siteAddress.line1.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 2
              </label>
              <input
                {...register('siteAddress.line2')}
                className="input"
                placeholder="Apartment, suite, etc. (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                {...register('siteAddress.city')}
                className={cn('input', errors.siteAddress?.city && 'border-danger-300')}
                placeholder="Enter city"
              />
              {errors.siteAddress?.city && (
                <p className="mt-1 text-sm text-danger-600">{errors.siteAddress.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <input
                {...register('siteAddress.state')}
                className={cn('input', errors.siteAddress?.state && 'border-danger-300')}
                placeholder="FL"
                maxLength={2}
              />
              {errors.siteAddress?.state && (
                <p className="mt-1 text-sm text-danger-600">{errors.siteAddress.state.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code *
              </label>
              <input
                {...register('siteAddress.zip')}
                className={cn('input', errors.siteAddress?.zip && 'border-danger-300')}
                placeholder="Enter ZIP code"
              />
              {errors.siteAddress?.zip && (
                <p className="mt-1 text-sm text-danger-600">{errors.siteAddress.zip.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Additional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parcel Number
              </label>
              <input
                {...register('parcelNumber')}
                className="input"
                placeholder="Enter parcel number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flood Zone
              </label>
              <input
                {...register('floodZone')}
                className="input"
                placeholder="Enter flood zone"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wind Exposure
              </label>
              <input
                {...register('windExposure')}
                className="input"
                placeholder="Enter wind exposure"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zoning Approval Reference
              </label>
              <input
                {...register('zoningApprovalRef')}
                className="input"
                placeholder="Enter zoning approval reference"
              />
            </div>
          </div>
        </div>

        {/* Mobile Home Details */}
        {showMobileHomeFields && (
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">
              {permitType === 'MOBILE_HOME' ? 'Mobile Home' : 'Modular Home'} Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Make/Model
                </label>
                <input
                  {...register('mobileHome.makeModel')}
                  className="input"
                  placeholder="Enter make and model"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  {...register('mobileHome.year', { valueAsNumber: true })}
                  className="input"
                  placeholder="Enter year"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Width (feet)
                </label>
                <input
                  type="number"
                  {...register('mobileHome.widthFt', { valueAsNumber: true })}
                  className="input"
                  placeholder="Enter width"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Length (feet)
                </label>
                <input
                  type="number"
                  {...register('mobileHome.lengthFt', { valueAsNumber: true })}
                  className="input"
                  placeholder="Enter length"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serial/VIN
                </label>
                <input
                  {...register('mobileHome.serialVIN')}
                  className="input"
                  placeholder="Enter serial or VIN"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HUD Label
                </label>
                <input
                  {...register('mobileHome.hudLabel')}
                  className="input"
                  placeholder="Enter HUD label"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Installer License
                </label>
                <input
                  {...register('mobileHome.installerLicense')}
                  className="input"
                  placeholder="Enter installer license"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foundation Type
                </label>
                <select {...register('mobileHome.foundationType')} className="input">
                  <option value="">Select foundation type</option>
                  <option value="piers">Piers</option>
                  <option value="slab">Slab</option>
                  <option value="stem_wall">Stem Wall</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tie-down System
                </label>
                <input
                  {...register('mobileHome.tieDownSystem')}
                  className="input"
                  placeholder="Enter tie-down system"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wind Zone
                </label>
                <input
                  {...register('mobileHome.windZone')}
                  className="input"
                  placeholder="Enter wind zone"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Link
            to="/packages"
            className="btn-secondary"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createPackageMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            {createPackageMutation.isPending ? (
              <>
                <LoadingSpinner size="sm" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Create Package
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
