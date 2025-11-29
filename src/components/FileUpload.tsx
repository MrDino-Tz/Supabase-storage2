'use client'

import { useState, useRef } from 'react'
import { getSupabaseClient } from '@/lib/supabase-client'

interface FileUploadProps {
  bucket: string
  onUploadComplete?: (url: string) => void
}

export default function FileUpload({ bucket, onUploadComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      setProgress(0)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${bucket}/${fileName}`

      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      onUploadComplete?.(publicUrl)
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

    } catch (error) {
      alert(`Error uploading file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Upload File to {bucket}</h3>
      
      <div className="space-y-4">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={uploadFile}
            disabled={uploading}
            accept="image/*,video/*,.pdf,.doc,.docx"
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {uploading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {uploading && (
          <p className="text-sm text-gray-600">
            Uploading... {Math.round(progress)}%
          </p>
        )}
      </div>
    </div>
  )
}
