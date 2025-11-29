'use client'

import { useState } from 'react'
import FileUpload from '@/components/FileUpload'
import FileList from '@/components/FileList'

interface StorageManagerProps {
  user: any
}

export default function StorageManager({ user }: StorageManagerProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleUploadComplete = (url: string) => {
    console.log('File uploaded:', url)
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">File Storage</h2>
        <p className="text-gray-600 mt-2">
          Upload, manage, and organize your files in Supabase Storage.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-1">
          <FileUpload 
            bucket="user-files" 
            onUploadComplete={handleUploadComplete}
          />
          
          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Storage Features</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Upload any file type</li>
              <li>• Automatic file organization</li>
              <li>• Public URL generation</li>
              <li>• Download and delete options</li>
            </ul>
          </div>
        </div>

        {/* File List Section */}
        <div className="lg:col-span-2">
          <FileList 
            bucket="user-files"
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>
    </div>
  )
}
