'use client'

import { useState, useEffect } from 'react'
import FileUpload from '@/components/FileUpload'
import FileList from '@/components/FileList'
import { getSupabaseClient } from '@/lib/supabase-client'

interface StorageManagerProps {
  user: any
}

export default function StorageManager({ user }: StorageManagerProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [selectedBucket, setSelectedBucket] = useState('user-files')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'created_at'>('created_at')
  const [filterType, setFilterType] = useState<'all' | 'images' | 'documents' | 'videos'>('all')

  // Available storage buckets with descriptions
  const buckets = [
    { id: 'user-files', name: 'User Files', description: 'General file storage for all file types' },
    { id: 'documents', name: 'Documents', description: 'PDF, Word, Excel, and text files' },
    { id: 'media', name: 'Media', description: 'Images, videos, and audio files' },
    { id: 'archives', name: 'Archives', description: 'ZIP files and compressed archives' },
  ]

  // Handle file upload completion
  const handleUploadComplete = (url: string) => {
    console.log('File uploaded:', url)
    setRefreshTrigger(prev => prev + 1)
  }

  // Get file type category based on MIME type or extension
  const getFileCategory = (fileName: string): 'images' | 'documents' | 'videos' | 'other' => {
    const ext = fileName.split('.').pop()?.toLowerCase() || ''
    
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico']
    const documentExts = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx']
    const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv']
    
    if (imageExts.includes(ext)) return 'images'
    if (documentExts.includes(ext)) return 'documents'
    if (videoExts.includes(ext)) return 'videos'
    return 'other'
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">File Storage</h2>
            <p className="text-gray-600 mt-2">
              Upload, manage, and organize your files in Supabase Storage with advanced filtering and search.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Upload and Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Bucket Selection */}
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Storage Bucket</h3>
            <div className="space-y-2">
              {buckets.map((bucket) => (
                <div
                  key={bucket.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedBucket === bucket.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedBucket(bucket.id)}
                >
                  <div className="font-medium text-gray-900">{bucket.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{bucket.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Section */}
          <FileUpload 
            bucket={selectedBucket} 
            onUploadComplete={handleUploadComplete}
          />

          {/* Storage Stats */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Storage Features</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• 📁 Organized by buckets</li>
              <li>• 🔍 Advanced search</li>
              <li>• 🏷️ File type filtering</li>
              <li>• 📊 Sort by name/size/date</li>
              <li>• 🌐 Public URL generation</li>
              <li>• 📥 Download & delete</li>
              <li>• 🔄 Real-time updates</li>
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setSearchQuery('')
                  setFilterType('all')
                  setSortBy('created_at')
                  setRefreshTrigger(prev => prev + 1)
                }}
                className="w-full text-left px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
              >
                🔄 Refresh Files
              </button>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setFilterType('all')
                  setSortBy('created_at')
                }}
                className="w-full text-left px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
              >
                🧹 Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - File Management */}
        <div className="lg:col-span-3">
          {/* Search and Filter Controls */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Files</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by filename..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filter by Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Files</option>
                  <option value="images">Images</option>
                  <option value="documents">Documents</option>
                  <option value="videos">Videos</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="created_at">Date Uploaded</option>
                  <option value="name">File Name</option>
                  <option value="size">File Size</option>
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchQuery || filterType !== 'all') && (
              <div className="mt-3 flex items-center space-x-2 text-sm">
                <span className="text-gray-500">Active filters:</span>
                {searchQuery && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    Search: "{searchQuery}"
                  </span>
                )}
                {filterType !== 'all' && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                    Type: {filterType}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* File List with Filters */}
          <FileList 
            bucket={selectedBucket}
            refreshTrigger={refreshTrigger}
            searchQuery={searchQuery}
            filterType={filterType}
            sortBy={sortBy}
            getFileCategory={getFileCategory}
          />
        </div>
      </div>
    </div>
  )
}
