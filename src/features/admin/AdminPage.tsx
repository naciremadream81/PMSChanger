import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Settings, MapPin, Users, FileText } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { CountyTemplateManager } from './CountyTemplateManager'

export function AdminPage() {
  const [selectedCounty, setSelectedCounty] = useState<{ id: number; name: string } | null>(null)
  
  const { data: counties, isLoading } = useQuery({
    queryKey: ['counties'],
    queryFn: () => api.getCounties(),
  })

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600">Manage system settings and county configurations</p>
      </div>

      {/* Admin Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MapPin className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Florida Counties</p>
              <p className="text-2xl font-semibold text-gray-900">{counties?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">County Templates</p>
              <p className="text-2xl font-semibold text-gray-900">67</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">System Users</p>
              <p className="text-2xl font-semibold text-gray-900">-</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Settings className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">System Settings</p>
              <p className="text-2xl font-semibold text-gray-900">-</p>
            </div>
          </div>
        </div>
      </div>

      {/* County Management */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">County Management</h3>
        <p className="text-gray-500 mb-4">
          Manage checklist templates for each of Florida's 67 counties.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {counties?.slice(0, 9).map((county) => (
            <div key={county.id} className="p-4 border rounded-lg hover:bg-gray-50">
              <h4 className="font-medium text-gray-900">{county.name}</h4>
              <p className="text-sm text-gray-500">County ID: {county.id}</p>
              <button 
                onClick={() => setSelectedCounty({ id: county.id, name: county.name })}
                className="mt-2 text-sm text-primary-600 hover:text-primary-500"
              >
                Manage Templates
              </button>
            </div>
          ))}
        </div>
        
        {counties && counties.length > 9 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Showing first 9 of {counties.length} counties
            </p>
            <Link 
              to="/admin/counties"
              className="mt-2 text-sm text-primary-600 hover:text-primary-500"
            >
              View All Counties
            </Link>
          </div>
        )}
      </div>

      {/* County Template Manager Modal */}
      {selectedCounty && (
        <CountyTemplateManager
          countyId={selectedCounty.id}
          countyName={selectedCounty.name}
          onClose={() => setSelectedCounty(null)}
        />
      )}

      {/* System Settings */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">User Management</h4>
              <p className="text-sm text-gray-500">Add, edit, and manage system users</p>
            </div>
            <button className="btn-secondary">Manage Users</button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Backup & Restore</h4>
              <p className="text-sm text-gray-500">System backup and data restoration</p>
            </div>
            <button className="btn-secondary">Backup System</button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">System Logs</h4>
              <p className="text-sm text-gray-500">View system activity and audit logs</p>
            </div>
            <button className="btn-secondary">View Logs</button>
          </div>
        </div>
      </div>
    </div>
  )
}
