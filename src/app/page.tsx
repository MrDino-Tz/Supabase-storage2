'use client'

import { useState, useEffect } from 'react'
import Auth from '@/components/Auth'
import Navigation from '@/components/Navigation'
import ProfileUpload from '@/components/ProfileUpload'
import StorageManager from '@/components/StorageManager'
import ImageGallery from '@/components/ImageGallery'
import SupabaseProvider from '@/components/SupabaseProvider'
import { User } from '@supabase/supabase-js'

export default function Home() {
  // Global state for user authentication and navigation
  const [user, setUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState('profile')
  
  // Profile URL state persists across navigation - this is the key fix
  // Without this, the profile image would disappear when navigating between pages
  const [profileUrl, setProfileUrl] = useState<string | null>(null)

  // Load profile URL from user metadata when user changes
  useEffect(() => {
    if (user?.user_metadata?.profile_url) {
      setProfileUrl(user.user_metadata.profile_url)
    } else {
      setProfileUrl(null)
    }
  }, [user])

  // Handle user sign out - reset all user-related state
  const handleSignOut = () => {
    setUser(null)
    setCurrentPage('profile')
    setProfileUrl(null) // Clear profile image on sign out
  }

  // Router function to render the correct page component based on current navigation
  // This pattern allows for easy addition of new pages in the future
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'profile':
        // Pass profileUrl state down to ProfileUpload component
        // This ensures the profile image persists across navigation
        return <ProfileUpload user={user} profileUrl={profileUrl} setProfileUrl={setProfileUrl} />
      case 'storage':
        return <StorageManager user={user} />
      case 'gallery':
        return <ImageGallery user={user} />
      default:
        // Fallback to profile page
        return <ProfileUpload user={user} profileUrl={profileUrl} setProfileUrl={setProfileUrl} />
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
