'use client'
import Image from 'next/image';
import { Product } from '@/types'
import { Edit, Trash2, Star, Package } from 'lucide-react'

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: 'IRR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const discountPrice = product.discount_percentage > 0 
    ? product.price * (1 - product.discount_percentage / 100)
    : product.price

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 bg-gray-200">
        {product.image_url ? (
          <Image 
            src={product.image_url} 
            width={300}
            height={300}
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
        )}
        {product.is_featured && (
          <span className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
            ویژه
          </span>
        )}
        {product.is_bestseller && (
          <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
            پرفروش
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${i < Math.floor(product.average_rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 mr-1">({product.total_reviews})</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div>
            {product.discount_percentage > 0 ? (
              <div className="flex items-center">
                <span className="text-lg font-bold text-red-500">{formatPrice(discountPrice)}</span>
                <span className="text-sm text-gray-400 line-through mr-2">{formatPrice(product.price)}</span>
                <span className="text-xs bg-red-100 text-red-600 px-1 rounded">{product.discount_percentage}%</span>
              </div>
            ) : (
              <span className="text-lg font-bold">{formatPrice(product.price)}</span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            موجودی: {product.stock_quantity}
          </div>
        </div>
        <div className="flex justify-between">
          <button
            onClick={() => onEdit(product)}
            className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
          >
            <Edit className="h-4 w-4 ml-1" />
            ویرایش
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
          >
            <Trash2 className="h-4 w-4 ml-1" />
            حذف
          </button>
        </div>
      </div>
    </div>
  )
}