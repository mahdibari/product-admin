'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { X } from 'lucide-react'

interface DeleteBrandConfirmationProps {
  id: string
  onClose: () => void
  onDelete: () => void
}

export default function DeleteBrandConfirmation({ id, onClose, onDelete }: DeleteBrandConfirmationProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      onDelete()
      onClose()
    } catch (error) {
      console.error('Error deleting brand:', error)
      alert('خطایی در حذف برند رخ داد.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">تایید حذف برند</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <p className="text-gray-700 mb-6">
          آیا از حذف این برند اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
        </p>
        
        <div className="flex justify-end space-x-2 space-x-reverse">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            انصراف
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-red-300"
          >
            {loading ? 'در حال حذف...' : 'حذف'}
          </button>
        </div>
      </div>
    </div>
  )
}