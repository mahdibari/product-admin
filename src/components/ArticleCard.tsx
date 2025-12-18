'use client'

import { Article } from '@/types'
import { Edit, Trash2, Heart, Calendar } from 'lucide-react'

interface ArticleCardProps {
  article: Article
  onEdit: (article: Article) => void
  onDelete: (id: string) => void
}

export default function ArticleCard({ article, onEdit, onDelete }: ArticleCardProps) {
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'medium',
    }).format(new Date(dateString))
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <div className="p-4 flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{article.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.content}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <Heart className="h-4 w-4 ml-1 text-red-500" />
            {article.total_likes} لایک
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 ml-1" />
            {formatDate(article.created_at)}
          </div>
        </div>
      </div>
      <div className="flex justify-between p-4 border-t">
        <button
          onClick={() => onEdit(article)}
          className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
        >
          <Edit className="h-4 w-4 ml-1" />
          ویرایش
        </button>
        <button
          onClick={() => onDelete(article.id)}
          className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
        >
          <Trash2 className="h-4 w-4 ml-1" />
          حذف
        </button>
      </div>
    </div>
  )
}