// components/DeleteReviewConfirmation.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Trash2 } from 'lucide-react'

interface DeleteReviewConfirmationProps {
  id: string
  onClose: () => void
  onDelete: () => void
}

export default function DeleteReviewConfirmation({ id, onClose, onDelete }: DeleteReviewConfirmationProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id)

      if (error) throw error

      onDelete()
      onClose()
    } catch (error) {
      console.error('Error deleting review:', error)
      alert('خطایی در حذف نظر رخ داد.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <div className="flex items-center mb-4">
          <Trash2 className="h-6 w-6 text-red-500 ml-3" />
          <h3 className="text-lg font-semibold">حذف نظر</h3>
        </div>
        <p className="text-gray-600 mb-6">آیا از حذف این نظر اطمینان دارید؟ این عمل غیرقابل بازگشت است.</p>
        <div className="flex justify-end space-x-2 space-x-reverse">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            انصراف
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? 'در حال حذف...' : 'حذف'}
          </button>
        </div>
      </div>
    </div>
  )
}