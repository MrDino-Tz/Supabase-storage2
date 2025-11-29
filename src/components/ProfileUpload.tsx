'use client'

import { useState, useRef } from 'react'
import { getSupabaseClient } from '@/lib/supabase-client'
import Image from 'next/image'

interface ProfileUploadProps {
  user: any
}

export default function ProfileUpload({ user }: ProfileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [profileUrl, setProfileUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadProfileImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB')
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed')
      }

      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `profile-${user.id}-${Date.now()}.${fileExt}`
      const filePath = `profiles/${fileName}`

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setProfileUrl(publicUrl)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

    } catch (error) {
      alert(`Error uploading profile image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Profile Picture</h2>
          <p className="text-sm text-gray-500 mt-1">
            Upload a profile picture. It will be visible to other users.
          </p>
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-6">
            {/* Profile Image Preview */}
            <div className="flex-shrink-0">
              <div className="relative">
                {profileUrl ? (
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200">
                    <Image
                      src={profileUrl}
                      alt="Profile"
                      width={96}
                      height={96}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-gray-200 flex items-center justify-center">
                    <span className="text-2xl text-gray-400">👤</span>
                  </div>
                )}
                
                {uploading && (
                  <div className="absolute inset-0 w-24 h-24 rounded-full bg-white bg-opacity-75 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Button */}
            <div className="flex-1">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={uploadProfileImage}
                  disabled={uploading}
                  accept="image/*"
                  className="hidden"
                  id="profile-upload"
                />
                <label
                  htmlFor="profile-upload"
                  className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm cursor-pointer transition-colors ${
                    uploading
                      ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed'
                      : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {uploading ? 'Uploading...' : 'Upload Profile Picture'}
                </label>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                JPG, PNG or GIF. Maximum file size 5MB.
              </p>
            </div>
          </div>

          {profileUrl && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                ✅ Profile picture uploaded successfully!
              </p>
              <p className="text-xs text-green-600 mt-1">
                URL: {profileUrl}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-white shadow rounded-lg mt-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">User Information</h2>
        </div>
        <div className="p-6">
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="text-sm text-gray-900">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">User ID</dt>
              <dd className="text-sm text-gray-900 font-mono">{user?.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Sign In</dt>
              <dd className="text-sm text-gray-900">
                {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Unknown'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
