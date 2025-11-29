'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase-client'

interface NavigationProps {
  user: User | null
  currentPage: string
  onPageChange: (page: string) => void
  onSignOut: () => void
}

export default function Navigation({ user, currentPage, onPageChange, onSignOut }: NavigationProps) {
  const supabase = getSupabaseClient()

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    onSignOut()
  }

  const pages = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'storage', label: 'Storage', icon: '📁' },
    { id: 'gallery', label: 'Gallery', icon: '🖼️' },
  ]

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-900">Supabase Demo</h1>
            
            {user && (
              <nav className="flex space-x-1">
                {pages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => onPageChange(page.id)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentPage === page.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{page.icon}</span>
                    {page.label}
                  </button>
                ))}
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-700">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Sign Out
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
