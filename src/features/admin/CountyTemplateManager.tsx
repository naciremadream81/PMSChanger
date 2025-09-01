import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  CheckCircle,
  AlertCircle,
  Building2,
  Home,
  Warehouse
} from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { 
  CountyChecklistTemplateItem,
  CHECKLIST_CATEGORIES,
  getPermitTypeLabel
} from '@/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'

const templateItemSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  category: z.string().min(1, 'Category is required'),
  permitType: z.enum(['RESIDENTIAL', 'MOBILE_HOME', 'MODULAR_HOME']).optional(),
  required: z.boolean(),
  sort: z.number().min(0),
})

type FormData = z.infer<typeof templateItemSchema>

interface CountyTemplateManagerProps {
  countyId: number
  countyName: string
  onClose: () => void
}

export function CountyTemplateManager({ countyId, countyName, onClose }: CountyTemplateManagerProps) {
  const [editingItem, setEditingItem] = useState<CountyChecklistTemplateItem | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedPermitType, setSelectedPermitType] = useState<'ALL' | 'RESIDENTIAL' | 'MOBILE_HOME' | 'MODULAR_HOME'>('ALL')
  const queryClient = useQueryClient()

  const { data: templates, isLoading } = useQuery({
    queryKey: ['county-templates', countyId],
    queryFn: () => api.getCountyTemplates(countyId),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(templateItemSchema),
    defaultValues: {
      required: true,
      sort: 0,
    },
  })

  const createTemplateMutation = useMutation({
    mutationFn: (data: FormData) => api.createCountyTemplate(countyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['county-templates', countyId] })
      reset()
      setShowForm(false)
    },
  })

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FormData> }) =>
      api.updateCountyTemplate(countyId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['county-templates', countyId] })
      reset()
      setEditingItem(null)
      setShowForm(false)
    },
  })

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => api.deleteCountyTemplate(countyId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['county-templates', countyId] })
    },
  })

  const onSubmit = (data: FormData) => {
    const templateData = {
      ...data,
      permitType: data.permitType || null, // Convert empty to null for "all permit types"
    }

    if (editingItem) {
      updateTemplateMutation.mutate({ id: editingItem.id, data: templateData })
    } else {
      createTemplateMutation.mutate(templateData)
    }
  }

  const handleEdit = (item: CountyChecklistTemplateItem) => {
    setEditingItem(item)
    reset({
      label: item.label,
      category: item.category,
      permitType: item.permitType || undefined,
      required: item.required,
      sort: item.sort,
    })
    setShowForm(true)
  }

  const handleCancel = () => {
    reset()
    setEditingItem(null)
    setShowForm(false)
  }

  const filteredTemplates = templates?.filter(item => {
    if (selectedPermitType === 'ALL') return true
    return item.permitType === selectedPermitType || item.permitType === null
  }) || []

  const groupedTemplates = filteredTemplates.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, CountyChecklistTemplateItem[]>)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {countyName} County - Checklist Templates
            </h2>
            <p className="text-sm text-gray-500">
              Manage permit type checklists for {countyName} County
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - Templates List */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Filter and Add Button */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Filter by Permit Type:</label>
                <select
                  value={selectedPermitType}
                  onChange={(e) => setSelectedPermitType(e.target.value as any)}
                  className="input text-sm"
                >
                  <option value="ALL">All Permit Types</option>
                  <option value="RESIDENTIAL">Residential</option>
                  <option value="MOBILE_HOME">Mobile Home</option>
                  <option value="MODULAR_HOME">Modular Home</option>
                </select>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Template Item
              </button>
            </div>

            {/* Templates by Category */}
            <div className="space-y-6">
              {Object.entries(groupedTemplates).map(([category, items]) => (
                <div key={category} className="border rounded-lg">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h3 className="font-medium text-gray-900">{category}</h3>
                    <p className="text-sm text-gray-500">
                      {items.length} item{items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="divide-y">
                    {items
                      .sort((a, b) => a.sort - b.sort)
                      .map((item) => (
                        <div key={item.id} className="p-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {item.label}
                                </span>
                                {item.required && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Required
                                  </span>
                                )}
                                {!item.required && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Optional
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>Sort: {item.sort}</span>
                                {item.permitType ? (
                                  <div className="flex items-center space-x-1">
                                    {item.permitType === 'RESIDENTIAL' && <Home className="h-3 w-3" />}
                                    {item.permitType === 'MOBILE_HOME' && <Building2 className="h-3 w-3" />}
                                    {item.permitType === 'MODULAR_HOME' && <Warehouse className="h-3 w-3" />}
                                    <span>{getPermitTypeLabel(item.permitType)}</span>
                                  </div>
                                ) : (
                                  <span className="text-primary-600">All Permit Types</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                                title="Edit template item"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteTemplateMutation.mutate(item.id)}
                                className="p-1 text-gray-400 hover:text-danger-600"
                                title="Delete template item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
              
              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No template items found for {selectedPermitType === 'ALL' ? 'any permit type' : selectedPermitType.toLowerCase()}
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-2 text-sm text-primary-600 hover:text-primary-500"
                  >
                    Add your first template item
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Add/Edit Form */}
          {showForm && (
            <div className="w-96 border-l bg-gray-50 p-6 overflow-y-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingItem ? 'Edit Template Item' : 'Add New Template Item'}
              </h3>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Label *
                  </label>
                  <input
                    {...register('label')}
                    className={cn('input', errors.label && 'border-danger-300')}
                    placeholder="Enter checklist item label"
                  />
                  {errors.label && (
                    <p className="mt-1 text-sm text-danger-600">{errors.label.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    {...register('category')}
                    className={cn('input', errors.category && 'border-danger-300')}
                  >
                    <option value="">Select category</option>
                    {CHECKLIST_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-danger-600">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permit Type
                  </label>
                  <select
                    {...register('permitType')}
                    className="input"
                  >
                    <option value="">All Permit Types</option>
                    <option value="RESIDENTIAL">Residential</option>
                    <option value="MOBILE_HOME">Mobile Home</option>
                    <option value="MODULAR_HOME">Modular Home</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty to apply to all permit types
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    {...register('sort', { valueAsNumber: true })}
                    className={cn('input', errors.sort && 'border-danger-300')}
                    placeholder="0"
                    min="0"
                  />
                  {errors.sort && (
                    <p className="mt-1 text-sm text-danger-600">{errors.sort.message}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('required')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Required item
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {(createTemplateMutation.isPending || updateTemplateMutation.isPending) ? (
                      <>
                        <LoadingSpinner size="sm" />
                        {editingItem ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {editingItem ? 'Update' : 'Create'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
