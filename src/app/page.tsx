'use client'

import { useState } from 'react'
import Auth from '@/components/Auth'
import Navigation from '@/components/Navigation'
import ProfileUpload from '@/components/ProfileUpload'
import StorageManager from '@/components/StorageManager'
import ImageGallery from '@/components/ImageGallery'
import SupabaseProvider from '@/components/SupabaseProvider'
import { User } from '@supabase/supabase-js'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState('profile')

  const handleSignOut = () => {
    setUser(null)
    setCurrentPage('profile')
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'profile':
        return <ProfileUpload user={user} />
      case 'storage':
        return <StorageManager user={user} />
      case 'gallery':
        return <ImageGallery user={user} />
      default:
        return <ProfileUpload user={user} />
    }
  }

  return (
    <SupabaseProvider>
      <div className="min-h-screen bg-gray-50">
        <Navigation
          user={user}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onSignOut={handleSignOut}
        />
        
        <main className="py-8">
          {!user ? (
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome to Supabase Demo
                </h1>
                <p className="text-gray-600">
                  Sign in to access your profile, storage, and gallery features.
                </p>
              </div>
              
              <Auth onAuthChange={setUser} />
            </div>
          ) : (
            <div className="px-4 sm:px-6 lg:px-8">
              {renderCurrentPage()}
            </div>
          )}
        </main>
      </div>
    </SupabaseProvider>
  )
}
