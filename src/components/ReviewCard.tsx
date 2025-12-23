// components/ReviewCard.tsx
'use client'

import { Review } from '@/types'
import { Trash2, Star, User, Package, Calendar } from 'lucide-react'

interface ReviewCardProps {
  review: Review
  onDelete: (id: string) => void
}

export default function ReviewCard({ review, onDelete }: ReviewCardProps) {
  const getUserName = () => {
    if (review.user.display_name) return review.user.display_name;
    if (review.user.first_name || review.user.last_name) return `${review.user.first_name || ''} ${review.user.last_name || ''}`.trim();
    return review.user.email;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <User className="h-4 w-4 ml-2 text-gray-400" />
              <span className="font-semibold text-gray-800">{getUserName()}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Package className="h-4 w-4 ml-2 text-gray-400" />
              <span>{review.product.name}</span>
            </div>
          </div>
          <button
            onClick={() => onDelete(review.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="حذف نظر"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
              />
            ))}
          </div>
        </div>

        <p className="text-gray-700 text-sm mb-3 line-clamp-3">{review.comment}</p>
        
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="h-3 w-3 ml-1" />
          <span>{formatDate(review.created_at)}</span>
        </div>
      </div>
    </div>
  )
}