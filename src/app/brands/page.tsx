'use client'

import { useState, useEffect, useCallback } from 'react'
import { Brand } from '@/types'
import { supabase } from '@/lib/supabase'
import BrandCard from '@/components/BrandCard'
import BrandForm from '@/components/BrandForm'
import DeleteBrandConfirmation from '@/components/DeleteBrandConfirmation'
import { Plus, Search } from 'lucide-react'

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchBrands = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setBrands(data || [])
      setFilteredBrands(data || [])
    } catch (error: unknown) {
      let errorMessage = 'خطایی در بارگذاری برندها رخ داد';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error('Error fetching brands:', errorMessage);
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBrands()
  }, [fetchBrands])

  useEffect(() => {
    if (searchTerm) {
      const filtered = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.slug.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredBrands(filtered)
    } else {
      setFilteredBrands(brands)
    }
  }, [searchTerm, brands])

  const handleAddBrand = () => {
    setCurrentBrand(null)
    setShowForm(true)
  }

  const handleEditBrand = (brand: Brand) => {
    setCurrentBrand(brand)
    setShowForm(true)
  }

  const handleDeleteBrand = (id: string) => {
    setDeleteId(id)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setCurrentBrand(null)
  }

  const handleFormSave = () => {
    fetchBrands()
  }

  const handleDeleteClose = () => {
    setDeleteId(null)
  }

  const handleDeleteConfirm = () => {
    fetchBrands()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">مدیریت برندها</h1>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="جستجوی برندها..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <button
              onClick={handleAddBrand}
              className="flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <Plus className="h-5 w-5 ml-2" />
              افزودن برند
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <p className="mt-2 text-gray-500">در حال بارگذاری برندها...</p>
            </div>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-1">هیچ برندی یافت نشد</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'موردی با جستجوی شما یافت نشد' : 'شما هنوز هیچ برندی اضافه نکرده‌اید'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddBrand}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-500 hover:bg-purple-600"
              >
                <Plus className="h-4 w-4 ml-2" />
                افزودن برند اول
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBrands.map(brand => (
              <BrandCard
                key={brand.id}
                brand={brand}
                onEdit={handleEditBrand}
                onDelete={handleDeleteBrand}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <BrandForm
          brand={currentBrand}
          onClose={handleFormClose}
          onSave={handleFormSave}
        />
      )}

      {deleteId && (
        <DeleteBrandConfirmation
          id={deleteId}
          onClose={handleDeleteClose}
          onDelete={handleDeleteConfirm}
        />
      )}
    </div>
  )
}