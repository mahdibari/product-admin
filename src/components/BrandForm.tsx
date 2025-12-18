'use client'

import { useState, useEffect } from 'react'
import { Brand } from '@/types'
import { supabase } from '@/lib/supabase'
import { X, Upload } from 'lucide-react'

interface BrandFormProps {
  brand: Brand | null
  onClose: () => void
  onSave: () => void
}

export default function BrandForm({ brand, onClose, onSave }: BrandFormProps) {
  const [formData, setFormData] = useState<Partial<Brand>>({
    name: '',
    slug: '',
    description: '',
    logo_url: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  useEffect(() => {
    if (brand) {
      setFormData(brand)
      setLogoPreview(brand.logo_url)
    }
  }, [brand])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadLogo = async (file: File): Promise<string | null> => {
    if (!file) return null;
    
    const fileExt = file.name.split('.').pop()
    const fileName = `brand-${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('brands-logos') // یک Bucket جداگانه برای لوگوها پیشنهاد می‌شود
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage
      .from('brands-logos')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-ا-ی]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let logoUrl = formData.logo_url;

      if (logoFile) {
        logoUrl = await uploadLogo(logoFile);
        if (!logoUrl) throw new Error("آپلود لوگو با شکست مواجه شد.");
      }
      
      const finalFormData = { 
        ...formData, 
        logo_url: logoUrl,
        slug: formData.slug || generateSlug(formData.name || '')
      };

      if (brand?.id) {
        const { error } = await supabase
          .from('brands')
          .update(finalFormData)
          .eq('id', brand.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('brands')
          .insert(finalFormData)
        if (error) throw error
      }
      
      onSave()
      onClose()
     } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('یک خطای ناشناخته در ذخیره برند رخ داد.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            {brand ? 'ویرایش برند' : 'افزودن برند جدید'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">نام برند</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">اسلاگ (Slug)</label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="مثال: brand-name"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">توضیحات</label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">لوگو برند</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400">
              <div className="space-y-1 text-center">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo Preview" className="mx-auto h-24 w-24 object-contain rounded-md" />
                ) : (
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="logo-upload" className="relative cursor-pointer font-medium text-purple-600 hover:text-purple-500">
                    <span>آپلود لوگو</span>
                    <input id="logo-upload" name="logo-upload" type="file" className="sr-only" accept="image/*" onChange={handleLogoChange} />
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 space-x-reverse pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">انصراف</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-purple-300">
              {loading ? 'در حال ذخیره...' : 'ذخیره'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}