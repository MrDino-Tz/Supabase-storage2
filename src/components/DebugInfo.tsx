'use client'

import { useEffect, useState } from 'react'

export default function DebugInfo() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({})

  useEffect(() => {
    setEnvVars({
      'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
      'isClient': typeof window !== 'undefined' ? 'Yes' : 'No',
    })
  }, [])

  return (
    <div className="bg-gray-100 p-4 rounded-lg text-xs font-mono">
      <h4 className="font-bold mb-2">Debug Info:</h4>
      <ul className="space-y-1">
        {Object.entries(envVars).map(([key, value]) => (
          <li key={key}>
            <span className="text-gray-600">{key}:</span> {value}
          </li>
        ))}
      </ul>
    </div>
  )
}
