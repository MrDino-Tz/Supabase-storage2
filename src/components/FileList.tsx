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
}

export default function FileList({ bucket, refreshTrigger }: FileListProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    fetchFiles()
  }, [bucket, refreshTrigger])

  const fetchFiles = async () => {
    try {
      setLoading(true)
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

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

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Files in {bucket}</h3>
      
      {files.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No files found in this bucket.</p>
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-3 flex-1">
                {isImageFile(file.name) ? (
                  <div className="relative w-12 h-12">
                    <Image
                      src={getPublicUrl(file.name)}
                      alt={file.name}
                      fill
                      className="object-cover rounded"
                      sizes="48px"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-500">
                      {file.name.split('.').pop()?.toUpperCase()}
                    </span>
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name.split('/').pop()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => downloadFile(file.name)}
                  disabled={downloading === file.name}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloading === file.name ? 'Downloading...' : 'Download'}
                </button>
                
                <button
                  onClick={() => deleteFile(file.name)}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
