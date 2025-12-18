'use client'

import { Brand } from '@/types'
import { Edit, Trash2 } from 'lucide-react'

interface BrandCardProps {
  brand: Brand
  onEdit: (brand: Brand) => void
  onDelete: (id: string) => void
}

export default function BrandCard({ brand, onEdit, onDelete }: BrandCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          {brand.logo_url && (
            <img src={brand.logo_url} alt={brand.name} className="h-12 w-12 object-contain rounded" />
          )}
          <div className="flex space-x-2 space-x-reverse">
            <button
              onClick={() => onEdit(brand)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="ویرایش"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(brand.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="حذف"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800">{brand.name}</h3>
        <p className="text-sm text-gray-500">Slug: {brand.slug}</p>
        {brand.description && <p className="text-sm text-gray-600 mt-2">{brand.description}</p>}
      </div>
    </div>
  )
}