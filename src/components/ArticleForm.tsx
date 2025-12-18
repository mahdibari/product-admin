'use client'

import { useState, useEffect } from 'react'
import { Article } from '@/types'
import { supabase } from '@/lib/supabase'
import { X } from 'lucide-react'

interface ArticleFormProps {
  article: Article | null
  onClose: () => void
  onSave: () => void
}

export default function ArticleForm({ article, onClose, onSave }: ArticleFormProps) {
  const [formData, setFormData] = useState<Partial<Article>>({
    title: '',
    slug: '',
    content: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (article) {
      setFormData(article)
    }
  }, [article])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (article?.id) {
        const { error } = await supabase
          .from('articles')
          .update(formData)
          .eq('id', article.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('articles')
          .insert(formData)
        
        if (error) throw error
      }
      
      onSave()
      onClose()
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('خطایی در ذخیره مقاله رخ داد')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            {article ? 'ویرایش مقاله' : 'افزودن مقاله جدید'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              عنوان مقاله
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title || ''}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
             Slug (آدرس مقاله)
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug || ''}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="مثال: how-to-code-in-nextjs"
            />
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              محتوای مقاله
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content || ''}
              onChange={handleChange}
              rows={10}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div className="flex justify-end space-x-2 space-x-reverse pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-purple-300"
            >
              {loading ? 'در حال ذخیره...' : 'ذخیره'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}