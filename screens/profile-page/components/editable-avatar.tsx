'use client'

import React, { useState, useRef } from 'react'
import UserAvatar from '@/components/side-nav/components/user-avatar'
import type { User as UserType } from '@/features/auth/users/types'
import { Camera } from 'lucide-react'

interface EditableAvatarProps {
  user: UserType
  onImageChange?: (file: File) => Promise<void>
}

const EditableAvatar = ({ user, onImageChange }: EditableAvatarProps) => {
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload if callback provided
    if (onImageChange) {
      setIsUploading(true)
      try {
        await onImageChange(file)
      } catch (error) {
        console.error('Failed to upload image:', error)
        setPreview(null)
        alert('Failed to upload image. Please try again.')
      } finally {
        setIsUploading(false)
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative group flex flex-col items-center justify-center">
        <button
          onClick={handleAvatarClick}
          disabled={isUploading}
          className="relative cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          title="Click to change avatar"
        >
          {preview ? (
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white">
              <img
                src={preview}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white bg-gray-300 flex items-center justify-center">
              <div className="text-2xl text-gray-600 font-semibold leading-none">
                {user?.name ? user.name.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
          )}
          
          {/* Camera icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-6 h-6 text-white" />
          </div>
        </button>


        {/* Loading indicator */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Change text link */}
        <button
            onClick={handleAvatarClick}
            disabled={isUploading}
            className="text-xs cursor-pointer text-foreground/60 hover:text-foreground underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            change
        </button>
      </div>


      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  )
}

export default EditableAvatar
