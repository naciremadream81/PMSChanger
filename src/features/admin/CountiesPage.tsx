import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, MapPin, FileText, Settings } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { CountyTemplateManager } from './CountyTemplateManager'
import { FLORIDA_COUNTIES } from '@/lib/utils'

export function CountiesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCounty, setSelectedCounty] = useState<{ id: number; name: string } | null>(null)
  
  const { data: counties, isLoading } = useQuery({
    queryKey: ['counties'],
    queryFn: () => api.getCounties(),
  })

  const filteredCounties = counties?.filter(county =>
    county.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

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
        <h1 className="text-2xl font-bold text-gray-900">Florida Counties</h1>
        <p className="text-gray-600">
          Manage checklist templates for all 67 Florida counties
        </p>
      </div>

      {/* Search and Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search counties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>{counties?.length || 0} Counties</span>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Template Management</span>
          </div>
        </div>
      </div>

      {/* Counties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCounties.map((county) => (
          <div 
            key={county.id} 
            className="card p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedCounty({ id: county.id, name: county.name })}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">{county.name}</h3>
                <p className="text-sm text-gray-500">County ID: {county.id}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Click to manage templates
              </span>
              <button className="text-sm text-primary-600 hover:text-primary-500 font-medium">
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCounties.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No counties found
          </h3>
          <p className="text-gray-500">
            {searchQuery ? 'Try adjusting your search terms.' : 'No counties are available.'}
          </p>
        </div>
      )}

      {/* County Template Manager Modal */}
      {selectedCounty && (
        <CountyTemplateManager
          countyId={selectedCounty.id}
          countyName={selectedCounty.name}
          onClose={() => setSelectedCounty(null)}
        />
      )}
    </div>
  )
}
