'use client'
import Image from 'next/image';
import { useState, useEffect } from 'react'
import { Product, Category, Brand } from '@/types'
import { supabase } from '@/lib/supabase'
import { X, Upload } from 'lucide-react'

interface ProductFormProps {
  product: Product | null
  onClose: () => void
  onSave: () => void
}



export default function ProductForm({ product, onClose, onSave }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    discount_percentage: 0,
    stock_quantity: 0,
    is_featured: false,
    is_bestseller: false,
    image_url: '',
    category_id: '',
    brand_id: '',
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
    fetchBrands()
    if (product) {
      setFormData(product)
      setImagePreview(product.image_url)
    }
  }, [product])

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    
    if (error) {
      console.error('Error fetching categories:', error)
    } else {
      setCategories(data || [])
    }
  }

  const fetchBrands = async () => {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('name')
    
    if (error) {
      console.error('Error fetching brands:', error)
    } else {
      setBrands(data || [])
    }
  }



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file) {
      console.log("Debug: No file provided to uploadImage function.");
      return null;
    }
    
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`
    
    console.log("Debug: Attempting to upload file to path:", filePath);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('products-images')
      .upload(filePath, file)

    if (uploadError) {
      console.error("Debug: Error uploading file to Supabase Storage:", uploadError);
      throw uploadError
    }

    console.log("Debug: File uploaded successfully. Data from upload:", uploadData);

    const { data } = supabase.storage
      .from('products-images')
      .getPublicUrl(filePath)

    const publicUrl = data.publicUrl;
    console.log("Debug: Generated public URL:", publicUrl);

    return publicUrl;
  }

  // --- تابع handleSubmit با دیباگ ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let imageUrl = formData.image_url; // شروع با URL موجود یا رشته خالی
      console.log("Debug: Initial imageUrl from formData:", imageUrl);

      if (imageFile) {
        console.log("Debug: A new imageFile is selected. Starting upload process...");
        imageUrl = await uploadImage(imageFile); // تلاش برای آپلود و گرفتن URL
        console.log("Debug: Upload process finished. The new imageUrl is:", imageUrl);
        if (!imageUrl) throw new Error("آپلود عکس با شکست مواجه شد و URL برگردانده نشد.");
      }

      const dataToSubmit = {
        ...formData,
        image_url: imageUrl, // URL جدید یا قدیم در اینجا قرار می‌گیرد
        category_id: formData.category_id || null,
        brand_id: formData.brand_id || null,
      };
      
      console.log("Debug: Final object that will be sent to the database:", dataToSubmit);

      if (product?.id) {
        console.log("Debug: Updating existing product with ID:", product.id);
        const { error } = await supabase
          .from('products')
          .update(dataToSubmit)
          .eq('id', product.id)
        if (error) throw error
      } else {
        console.log("Debug: Inserting a new product into the database.");
        const { error } = await supabase
          .from('products')
          .insert(dataToSubmit)
        if (error) throw error
      }
      
      onSave()
      onClose()
     } catch (error) {
      console.error('Full error object from Supabase:', error);
      
      let errorMessage = 'یک خطای ناشناخته در ذخیره محصول رخ داد.';
      if (error && typeof error === 'object' && 'message' in error) {
     
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            {product ? 'ویرایش محصول' : 'افزودن محصول جدید'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded">
              {error}
            </div>
          )}
          
          {/* ... فیلدهای قبلی ... */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              نام محصول
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              توضیحات
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              قیمت
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price || ''}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="discount_percentage" className="block text-sm font-medium text-gray-700 mb-1">
              درصد تخفیف
            </label>
            <input
              type="number"
              id="discount_percentage"
              name="discount_percentage"
              value={formData.discount_percentage || ''}
              onChange={handleChange}
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
              دسته‌بندی
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">انتخاب کنید</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="brand_id" className="block text-sm font-medium text-gray-700 mb-1">
              برند
            </label>
            <select
              id="brand_id"
              name="brand_id"
              value={formData.brand_id || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">انتخاب کنید</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700 mb-1">
              تعداد موجودی
            </label>
            <input
              type="number"
              id="stock_quantity"
              name="stock_quantity"
              value={formData.stock_quantity || ''}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">عکس محصول</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Preview" className="mx-auto h-32 w-32 object-cover rounded-md" width={300}  height={300}/>
                ) : (
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="image-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>آپلود فایل</span>
                    <input id="image-upload" name="image-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                  </label>
                  <p className="pr-1">یا کشیدن و رها کردن</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF تا 10MB</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 space-x-reverse">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured || false}
                onChange={handleChange}
                className="ml-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">محصول ویژه</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_bestseller"
                checked={formData.is_bestseller || false}
                onChange={handleChange}
                className="ml-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">محصول پرفروش</span>
            </label>
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
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? 'در حال ذخیره...' : 'ذخیره'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}