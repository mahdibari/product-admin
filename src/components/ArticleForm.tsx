'use client'

import { useState, useEffect, useRef } from 'react'
import { Article } from '@/types'
import { supabase } from '@/lib/supabase'
import { X, Upload, Loader2 } from 'lucide-react'
import Image from 'next/image'
import imageCompression from 'browser-image-compression'

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
    image_url: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (article) {
      setFormData(article)
      if (article.image_url) setImagePreview(article.image_url)
    }
  }, [article])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // منطق انتخاب و فشرده‌سازی تصویر
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      
      const options = {
        maxSizeMB: 0.8, // حداکثر ۸۰۰ کیلوبایت
        maxWidthOrHeight: 1200,
        useWebWorker: true
      }

      try {
        const compressedFile = await imageCompression(file, options)
        // تبدیل Blob به File برای سازگاری کامل با متد آپلود
        const finalFile = new File([compressedFile], file.name, { type: file.type })
        
        setImageFile(finalFile)
        setImagePreview(URL.createObjectURL(finalFile))
      } catch (err) {
        console.error("خطا در فشرده‌سازی:", err)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let currentImageUrl = formData.image_url

      // منطق آپلود تصویر دقیقاً مطابق خواسته شما
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        // ۱. آپلود در باکت مشخص شده
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('article_img')
          .upload(filePath, imageFile)

        if (uploadError) throw uploadError

        // ۲. دریافت لینک مستقیم
        const { data } = supabase.storage
          .from('article_img')
          .getPublicUrl(filePath)

        currentImageUrl = data.publicUrl
      }

      // ۳. آماده‌سازی دیتا برای ذخیره در جدول مقالات
      const articleToSave = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        image_url: currentImageUrl
      }

      if (article?.id) {
        const { error } = await supabase
          .from('articles')
          .update(articleToSave)
          .eq('id', article.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('articles')
          .insert([articleToSave])
        if (error) throw error
      }

      onSave()
      onClose()
    
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-[inherit]">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {article ? 'ویرایش مقاله' : 'افزودن مقاله جدید'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">تصویر اصلی</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative border-2 border-dashed border-gray-300 rounded-lg h-44 flex flex-col items-center justify-center bg-gray-50 hover:border-purple-500 cursor-pointer overflow-hidden transition-all"
            >
              {imagePreview ? (
                <Image src={imagePreview} alt="Preview" fill className="object-cover" />
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-10 w-10 text-gray-400" />
                  <span className="text-sm text-gray-500 mt-2 block">انتخاب عکس (فشرده‌سازی خودکار)</span>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-right">
              <label className="block text-sm font-medium text-gray-700 mb-1">عنوان</label>
              <input
                type="text"
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div className="text-right">
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                type="text"
                name="slug"
                value={formData.slug || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>
          
          <div className="text-right">
            <label className="block text-sm font-medium text-gray-700 mb-1">محتوا</label>
            <textarea
              name="content"
              value={formData.content || ''}
              onChange={handleChange}
              rows={8}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">انصراف</button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              ذخیره تغییرات
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}