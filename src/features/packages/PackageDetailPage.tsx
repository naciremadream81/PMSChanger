import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ArrowLeft, 
  Edit, 
  Upload, 
  Download, 
  Trash2, 
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Image,
  Plus,
  Eye
} from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { 
  formatDate, 
  getStatusColor, 
  getStatusLabel, 
  getPermitTypeLabel,
  formatFileSize,
  DOCUMENT_TAGS
} from '@/lib/utils'
import { PackageChecklistItem, Document } from '@/types'
import { SubcontractorManager } from './SubcontractorManager'

export function PackageDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState('ATTACHMENT')
  const [documentTag, setDocumentTag] = useState('')

  const { data: packageData, isLoading } = useQuery({
    queryKey: ['package', id],
    queryFn: () => api.getPackage(id!),
    enabled: !!id,
  })

  const { data: checklist } = useQuery({
    queryKey: ['checklist', id],
    queryFn: () => api.getPackageChecklist(id!),
    enabled: !!id,
  })

  const { data: documents } = useQuery({
    queryKey: ['documents', id],
    queryFn: () => api.getPackageDocuments(id!),
    enabled: !!id,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ status, note }: { status: string; note?: string }) =>
      api.updatePackageStatus(id!, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['package', id] })
    },
  })

  const updateChecklistMutation = useMutation({
    mutationFn: ({ itemId, completed }: { itemId: string; completed: boolean }) =>
      api.updateChecklistItem(id!, itemId, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist', id] })
    },
  })

  const uploadDocumentMutation = useMutation({
    mutationFn: (file: File) => api.uploadDocument(id!, file, documentType, documentTag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', id] })
      setSelectedFile(null)
      setDocumentType('ATTACHMENT')
      setDocumentTag('')
    },
  })

  const deleteDocumentMutation = useMutation({
    mutationFn: (documentId: string) => api.deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', id] })
    },
  })

  const fillPdfMutation = useMutation({
    mutationFn: (templateDocumentId: string) => api.fillPdf(id!, templateDocumentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', id] })
    },
  })

  const handleFileUpload = async () => {
    if (!selectedFile) return
    setUploading(true)
    try {
      await uploadDocumentMutation.mutateAsync(selectedFile)
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (document: Document) => {
    try {
      const url = await api.getDocumentDownloadUrl(document.id)
      const link = document.createElement('a')
      link.href = url
      link.download = document.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  if (isLoading || !packageData) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Eye },
    { id: 'checklist', name: 'Checklist', icon: CheckCircle },
    { id: 'subcontractors', name: 'Subcontractors', icon: Building2 },
    { id: 'documents', name: 'Documents', icon: FileText },
    { id: 'history', name: 'History', icon: Clock },
  ]

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
            <h1 className="text-2xl font-bold text-gray-900">{packageData.title}</h1>
            <p className="text-gray-600">
              {packageData.customer.name} • {packageData.county.name} • {getPermitTypeLabel(packageData.permitType)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={getStatusColor(packageData.status)}>
            {getStatusLabel(packageData.status)}
          </span>
          <Link
            to={`/packages/${id}/edit`}
            className="btn-secondary flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Package Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Package Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <p className="mt-1 text-sm text-gray-900">{packageData.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Permit Type</label>
                  <p className="mt-1 text-sm text-gray-900">{getPermitTypeLabel(packageData.permitType)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">County</label>
                  <p className="mt-1 text-sm text-gray-900">{packageData.county.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <p className="mt-1">
                    <span className={getStatusColor(packageData.status)}>
                      {getStatusLabel(packageData.status)}
                    </span>
                  </p>
                </div>
                {packageData.parcelNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Parcel Number</label>
                    <p className="mt-1 text-sm text-gray-900">{packageData.parcelNumber}</p>
                  </div>
                )}
                {packageData.dueDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Due Date</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(packageData.dueDate)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Site Address */}
            {packageData.siteAddress && (
              <div className="card p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Site Address</h3>
                <div className="text-sm text-gray-900">
                  <p>{packageData.siteAddress.line1}</p>
                  {packageData.siteAddress.line2 && <p>{packageData.siteAddress.line2}</p>}
                  <p>
                    {packageData.siteAddress.city}, {packageData.siteAddress.state} {packageData.siteAddress.zip}
                  </p>
                </div>
              </div>
            )}

            {/* Mobile Home Details */}
            {packageData.mobileHome && (
              <div className="card p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {packageData.permitType === 'MOBILE_HOME' ? 'Mobile Home' : 'Modular Home'} Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {packageData.mobileHome.makeModel && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Make/Model</label>
                      <p className="mt-1 text-sm text-gray-900">{packageData.mobileHome.makeModel}</p>
                    </div>
                  )}
                  {packageData.mobileHome.year && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Year</label>
                      <p className="mt-1 text-sm text-gray-900">{packageData.mobileHome.year}</p>
                    </div>
                  )}
                  {packageData.mobileHome.serialVIN && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Serial/VIN</label>
                      <p className="mt-1 text-sm text-gray-900">{packageData.mobileHome.serialVIN}</p>
                    </div>
                  )}
                  {packageData.mobileHome.hudLabel && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">HUD Label</label>
                      <p className="mt-1 text-sm text-gray-900">{packageData.mobileHome.hudLabel}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer & Contractor */}
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Customer & Contractor</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer</label>
                  <p className="mt-1 text-sm text-gray-900">{packageData.customer.name}</p>
                  {packageData.customer.phone && (
                    <p className="text-sm text-gray-500">{packageData.customer.phone}</p>
                  )}
                  {packageData.customer.email && (
                    <p className="text-sm text-gray-500">{packageData.customer.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contractor</label>
                  <p className="mt-1 text-sm text-gray-900">{packageData.contractor.companyName}</p>
                  {packageData.contractor.contactName && (
                    <p className="text-sm text-gray-500">{packageData.contractor.contactName}</p>
                  )}
                  {packageData.contractor.phone && (
                    <p className="text-sm text-gray-500">{packageData.contractor.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Status Update */}
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Update Status</h3>
              <div className="space-y-3">
                {['DRAFT', 'IN_REVIEW', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CLOSED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatusMutation.mutate({ status })}
                    disabled={updateStatusMutation.isPending || packageData.status === status}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      packageData.status === status
                        ? 'bg-primary-100 text-primary-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {getStatusLabel(status)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'checklist' && (
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Package Checklist</h3>
          {checklist && checklist.length > 0 ? (
            <div className="space-y-4">
              {checklist.map((item: PackageChecklistItem) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateChecklistMutation.mutate({ 
                        itemId: item.id, 
                        completed: !item.completed 
                      })}
                      disabled={updateChecklistMutation.isPending}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        item.completed
                          ? 'bg-success-500 border-success-500 text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {item.completed && <CheckCircle className="h-3 w-3" />}
                    </button>
                    <div>
                      <p className={`font-medium ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {item.label}
                      </p>
                      <p className="text-sm text-gray-500">{item.category}</p>
                      {item.required && (
                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-warning-100 text-warning-800 rounded">
                          Required
                        </span>
                      )}
                    </div>
                  </div>
                  {item.completed && item.completedAt && (
                    <span className="text-sm text-gray-500">
                      {formatDate(item.completedAt)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No checklist items found</p>
          )}
        </div>
      )}

      {activeTab === 'subcontractors' && (
        <SubcontractorManager packageId={id!} />
      )}

      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Document</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="input"
                  >
                    <option value="PDF_TEMPLATE">PDF Template</option>
                    <option value="ATTACHMENT">Attachment</option>
                    <option value="PHOTO">Photo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Document Tag</label>
                  <select
                    value={documentTag}
                    onChange={(e) => setDocumentTag(e.target.value)}
                    className="input"
                  >
                    <option value="">Select tag</option>
                    {DOCUMENT_TAGS.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">File</label>
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="input"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                </div>
              </div>
              <button
                onClick={handleFileUpload}
                disabled={!selectedFile || uploading}
                className="btn-primary flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Document
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Documents List */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
            {documents && documents.length > 0 ? (
              <div className="space-y-4">
                {documents.map((doc: Document) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded">
                        {doc.type === 'PDF_TEMPLATE' || doc.type === 'FILLED_PDF' ? (
                          <FileText className="h-5 w-5 text-gray-600" />
                        ) : doc.type === 'PHOTO' ? (
                          <Image className="h-5 w-5 text-gray-600" />
                        ) : (
                          <FileText className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doc.filename}</p>
                        <p className="text-sm text-gray-500">
                          {doc.type} • {formatFileSize(doc.size)} • {formatDate(doc.createdAt)}
                        </p>
                        {doc.tag && (
                          <span className="inline-block mt-1 px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded">
                            {doc.tag}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {doc.type === 'PDF_TEMPLATE' && (
                        <button
                          onClick={() => fillPdfMutation.mutate(doc.id)}
                          disabled={fillPdfMutation.isPending}
                          className="p-2 text-primary-600 hover:text-primary-700"
                          title="Fill PDF"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDownload(doc)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteDocumentMutation.mutate(doc.id)}
                        className="p-2 text-gray-400 hover:text-danger-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No documents uploaded yet</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Status History</h3>
          {packageData.logs && packageData.logs.length > 0 ? (
            <div className="space-y-4">
              {packageData.logs.map((log) => (
                <div key={log.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className="p-2 bg-primary-100 rounded">
                    <Clock className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      Status changed to {getStatusLabel(log.status)}
                    </p>
                    {log.note && (
                      <p className="text-sm text-gray-600 mt-1">{log.note}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(log.createdAt)} by {log.createdBy.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No status history available</p>
          )}
        </div>
      )}
    </div>
  )
}
