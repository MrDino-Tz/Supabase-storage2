'use client'

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase-client'
import Image from 'next/image'

interface GalleryImage {
  name: string
  url: string
  size?: number
  created_at: string
}

interface ImageGalleryProps {
  user: any
}

export default function ImageGallery({ user }: ImageGalleryProps) {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      setLoading(true)
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      // Fetch all files from the gallery bucket
      const { data, error } = await supabase.storage
        .from('gallery')
        .list('', {
          limit: 100,
          offset: 0
        })

      if (error) throw error

      // Get public URLs for all images
      const imageList: GalleryImage[] = []
      
      for (const file of data || []) {
        const { data: { publicUrl } } = supabase.storage
          .from('gallery')
          .getPublicUrl(file.name)

        // Only include image files
        const extension = file.name.split('.').pop()?.toLowerCase()
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
        
        if (extension && imageExtensions.includes(extension)) {
          imageList.push({
            name: file.name,
            url: publicUrl,
            size: file.size,
            created_at: file.created_at
          })
        }
      }

      setImages(imageList)
    } catch (error) {
      console.error('Error fetching images:', error)
    } finally {
      setLoading(false)
    }
  }

  const uploadToGallery = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed')
      }

      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `gallery-${user.id}-${Date.now()}.${fileExt}`
      const filePath = fileName

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Refresh the gallery
      await fetchImages()

      // Reset file input
      event.target.value = ''
    } catch (error) {
      alert(`Error uploading to gallery: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const deleteImage = async (imageName: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { error } = await supabase.storage
        .from('gallery')
        .remove([imageName])

      if (error) throw error

      // Refresh the gallery
      await fetchImages()
      
      // Close modal if this image was selected
      if (selectedImage?.name === imageName) {
        setSelectedImage(null)
      }
    } catch (error) {
      alert(`Error deleting image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Image Gallery</h2>
            <p className="text-gray-600 mt-2">
              Your personal image collection from Supabase Storage.
            </p>
          </div>
          
          <label className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-md shadow-sm bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">
            📤 Upload to Gallery
            <input
              type="file"
              onChange={uploadToGallery}
              accept="image/*"
              className="hidden"
            />
          </label>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <div className="text-6xl mb-4">🖼️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No images yet</h3>
          <p className="text-gray-500 mb-4">
            Upload your first image to get started with your gallery.
          </p>
          <label className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-md shadow-sm bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">
            Upload First Image
            <input
              type="file"
              onChange={uploadToGallery}
              accept="image/*"
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => (
            <div
              key={image.name}
              className="relative group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              onClick={() => setSelectedImage(image)}
            >
              <div className="aspect-square relative">
                <Image
                  src={image.url}
                  alt={image.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-center">
                  <p className="text-sm font-medium">View Full Size</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">{selectedImage.name}</h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="relative max-h-96 mb-4">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  width={800}
                  height={600}
                  className="object-contain mx-auto"
                />
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div>
                  <p>Size: {selectedImage.size ? `${(selectedImage.size / 1024).toFixed(1)} KB` : 'Unknown'}</p>
                  <p>Uploaded: {new Date(selectedImage.created_at).toLocaleDateString()}</p>
                </div>
                
                <div className="space-x-2">
                  <a
                    href={selectedImage.url}
                    download
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Download
                  </a>
                  <button
                    onClick={() => deleteImage(selectedImage.name)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
