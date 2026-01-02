'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/types'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import ProductForm from '@/components/ProductForm'
import DeleteConfirmation from '@/components/DeleteConfirmation'
import { Plus, Search, FileText, Users, MessageSquare } from 'lucide-react'
// در فایل app/page.tsx یا فایل مسیرهای خود
// در فایل app/page.tsx یا فایل مسیرهای خود





import Link from 'next/link'


export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [searchTerm, products])

  const fetchProducts = async () => {
    setLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setProducts(data || [])
      setFilteredProducts(data || [])
     } catch (error) {
      // --- بخش اصلاح شده ---
      let errorMessage = 'خطایی در بارگذاری محصولات رخ داد';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error('Error fetching products:', errorMessage);
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = () => {
    setCurrentProduct(null)
    setShowForm(true)
  }

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product)
    setShowForm(true)
  }

  const handleDeleteProduct = (id: string) => {
    setDeleteId(id)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setCurrentProduct(null)
  }

  const handleFormSave = () => {
    fetchProducts()
  }

  const handleDeleteClose = () => {
    setDeleteId(null)
  }

  const handleDeleteConfirm = () => {
    fetchProducts()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">مدیریت محصولات</h1>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="جستجوی محصولات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <button
              onClick={handleAddProduct}
              className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <Plus className="h-5 w-5 ml-2" />
              افزودن محصول
            </button>
                <Link
    href="/brands"
    className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
  >
    {/* می‌توانید یک آیکون مناسب برای برند انتخاب کنید */}
    <span className="ml-2">B</span> 
    مدیریت برندها
  </Link>
             <div className="flex gap-2">
              <Link
                href="/articles"
                className="flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <FileText className="h-5 w-5 ml-2" />
                مدیریت مقالات
              </Link>

              <Link
  href="/users"
  className="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
>
  <Users className="h-5 w-5 ml-2" />
  مشاهده کاربران
</Link>

<Link
  href="/reviews"
  className="flex items-center justify-center bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
>
  <MessageSquare className="h-5 w-5 ml-2" />
  مدیریت نظرات
</Link>
             
           
            </div>
             
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-500">در حال بارگذاری محصولات...</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">هیچ محصولی یافت نشد</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'موردی با جستجوی شما یافت نشد' : 'شما هنوز هیچ محصولی اضافه نکرده‌اید'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddProduct}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 ml-2" />
                افزودن محصول اول
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <ProductForm
          product={currentProduct}
          onClose={handleFormClose}
          onSave={handleFormSave}
        />
      )}

      {deleteId && (
        <DeleteConfirmation
          id={deleteId}
          onClose={handleDeleteClose}
          onDelete={handleDeleteConfirm}
        />
      )}
    </div>
  )
}