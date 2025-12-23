'use client'

import { User } from '@/types'
import { Edit, Trash2, Mail, Phone, Calendar } from 'lucide-react'

interface UserCardProps {
  user: User
  onEdit?: (user: User) => void
  onDelete?: (id: string) => void
}

export default function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR')
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">
            {user.display_name || `${user.first_name || ''} ${user.last_name || ''}` || 'کاربر ناشناس'}
          </h3>
          {onEdit && onDelete && (
            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={() => onEdit(user)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="ویرایش"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(user.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="حذف"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="h-4 w-4 ml-2 text-gray-400" />
            <span>{user.email}</span>
          </div>
          
          {user.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 ml-2 text-gray-400" />
              <span>{user.phone}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 ml-2 text-gray-400" />
            <span>تاریخ عضویت: {formatDate(user.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}