'use client'

import { useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase-client'

interface ImageProcessorProps {
  bucket: string
  selectedFile: string
  onProcessComplete?: (processedUrl: string) => void
}

export default function ImageProcessor({ bucket, selectedFile, onProcessComplete }: ImageProcessorProps) {
  const [processing, setProcessing] = useState(false)
  const [operation, setOperation] = useState<'resize' | 'compress' | 'thumbnail'>('resize')
  const [width, setWidth] = useState(300)
  const [height, setHeight] = useState(300)
  const [quality, setQuality] = useState(80)

  const processImage = async () => {
    if (!selectedFile) {
      alert('Please select a file first')
      return
    }

    try {
      setProcessing(true)

      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { data, error } = await supabase.functions.invoke('image-process', {
        body: {
          bucket,
          fileName: selectedFile,
          operation,
          width: operation === 'resize' ? width : undefined,
          height: operation === 'resize' ? height : undefined,
          quality: operation === 'compress' ? quality : undefined
        }
      })

      if (error) throw error

      if (data?.success) {
        alert(`Image processed successfully! Processed file: ${data.processedFileName}`)
        onProcessComplete?.(data.publicUrl)
      } else {
        throw new Error(data?.error || 'Processing failed')
      }

    } catch (error) {
      alert(`Error processing image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Process Image</h3>
      
      {selectedFile ? (
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm font-medium">Selected File:</p>
            <p className="text-sm text-gray-600 truncate">{selectedFile.split('/').pop()}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operation
            </label>
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="resize">Resize</option>
              <option value="compress">Compress</option>
              <option value="thumbnail">Thumbnail</option>
            </select>
          </div>

          {operation === 'resize' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width (px)
                </label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  min="10"
                  max="2000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (px)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  min="10"
                  max="2000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {operation === 'compress' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quality ({quality}%)
              </label>
              <input
                type="range"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                min="10"
                max="100"
                className="w-full"
              />
            </div>
          )}

          <button
            onClick={processImage}
            disabled={processing}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Processing...' : 'Process Image'}
          </button>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">
          Select a file from the list to process it
        </p>
      )}
    </div>
  )
}
