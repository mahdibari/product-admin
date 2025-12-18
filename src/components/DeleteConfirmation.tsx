'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Trash2 } from 'lucide-react'

interface DeleteConfirmationProps {
  id: string
  onClose: () => void
  onDelete: () => void
}

export default function DeleteConfirmation({ id, onClose, onDelete }: DeleteConfirmationProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      onDelete()
      onClose()
     } catch (error) {
      // --- بخش اصلاح شده ---
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('یک خطای ناشناخته در ذخیره محصول رخ داد.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <div className="mr-4">
            <h3 className="text-lg font-medium text-gray-900">حذف محصول</h3>
            <p className="text-sm text-gray-500">آیا از حذف این محصول اطمینان دارید؟ این عمل غیرقابل بازگشت است.</p>
          </div>
          <button 
            onClick={onClose}
            className="flex-shrink-0 ml-auto text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="flex justify-end space-x-2 space-x-reverse">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            انصراف
          </button>
          <button
            type="button"
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