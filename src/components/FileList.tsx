'use client'

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase-client'
import Image from 'next/image'

interface FileItem {
  name: string
  id: string
  created_at: string
  size?: number
  metadata?: Record<string, any>
}

interface FileListProps {
  bucket: string
  refreshTrigger?: number
  searchQuery?: string
  filterType?: 'all' | 'images' | 'documents' | 'videos'
  sortBy?: 'name' | 'size' | 'created_at'
  getFileCategory?: (fileName: string) => 'images' | 'documents' | 'videos' | 'other'
}

export default function FileList({ 
  bucket, 
  refreshTrigger, 
  searchQuery = '', 
  filterType = 'all', 
  sortBy = 'created_at',
  getFileCategory 
}: FileListProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)

  // Fetch files from Supabase Storage
  const fetchFiles = async () => {
    try {
      setLoading(true)
      const supabase = getSupabaseClient()
      if (!supabase) return

      const { data, error } = await supabase.storage
        .from(bucket)
        .list('', {
          limit: 100,
          offset: 0
        })

      if (error) throw error
      setFiles(data || [])
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [bucket, refreshTrigger])

  // Filter and sort files based on search, type, and sort criteria
  const filteredAndSortedFiles = files
    .filter(file => {
      // Search filter
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
      
      // Type filter
      let matchesType = true
      if (filterType !== 'all' && getFileCategory) {
        const category = getFileCategory(file.name)
        matchesType = category === filterType
      }
      
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'size':
          return (b.size || 0) - (a.size || 0)
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:
          return 0
      }
    })

  const downloadFile = async (fileName: string) => {
    try {
      setDownloading(fileName)
      
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .download(fileName)

      if (error) throw error

      // Create download link
      const url = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName.split('/').pop() || fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

    } catch (error) {
      alert(`Error downloading file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setDownloading(null)
    }
  }

  const deleteFile = async (fileName: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName])

      if (error) throw error

      // Refresh file list
      await fetchFiles()
    } catch (error) {
      alert(`Error deleting file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const getPublicUrl = (fileName: string) => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return ''
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)
    return data.publicUrl
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const isImageFile = (fileName: string) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
    const ext = fileName.split('.').pop()?.toLowerCase()
    return imageExtensions.includes(ext || '')
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {bucket.charAt(0).toUpperCase() + bucket.slice(1).replace('-', ' ')} Files
          </h3>
          <div className="text-sm text-gray-500">
            {filteredAndSortedFiles.length} of {files.length} files
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4 py-3 border-b border-gray-200 last:border-0">
                <div className="h-10 w-10 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedFiles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || filterType !== 'all' ? 'No files match your filters' : 'No files yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || filterType !== 'all' 
                ? 'Try adjusting your search or filters to find files.'
                : 'Upload your first file to get started with storage.'
              }
            </p>
            {(searchQuery || filterType !== 'all') && (
              <button
                onClick={() => {
                  // This would be handled by parent component
                  console.log('Clear filters')
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAndSortedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  {/* File Icon */}
                  <div className="flex-shrink-0">
                    {getFileCategory && getFileCategory(file.name) === 'images' ? (
                      <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                        <span className="text-blue-600">🖼️</span>
                      </div>
                    ) : getFileCategory && getFileCategory(file.name) === 'documents' ? (
                      <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center">
                        <span className="text-green-600">📄</span>
                      </div>
                    ) : getFileCategory && getFileCategory(file.name) === 'videos' ? (
                      <div className="w-10 h-10 bg-purple-100 rounded flex items-center justify-center">
                        <span className="text-purple-600">🎥</span>
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-gray-600">📎</span>
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{formatFileSize(file.size)}</span>
                      <span>{new Date(file.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => downloadFile(file.name)}
                    disabled={downloading === file.name}
                    className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloading === file.name ? 'Downloading...' : 'Download'}
                  </button>
                  <button
                    onClick={() => deleteFile(file.name)}
                    className="inline-flex items-center px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
