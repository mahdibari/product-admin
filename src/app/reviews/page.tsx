// app/reviews/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Review } from '@/types'
import { supabase } from '@/lib/supabase'
import ReviewCard from '@/components/ReviewCard'
import DeleteReviewConfirmation from '@/components/DeleteReviewConfirmation'
import { Search, MessageSquare } from 'lucide-react'

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user:users ( display_name, first_name, last_name, email ),
          product:products ( name )
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setReviews(data || [])
      setFilteredReviews(data || [])
    } catch (error: unknown) {
      let errorMessage = 'خطایی در بارگذاری نظرات رخ داد';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error('Error fetching reviews:', errorMessage);
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  useEffect(() => {
    if (searchTerm) {
      const filtered = reviews.filter(review =>
        review.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (review.user.display_name && review.user.display_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        review.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredReviews(filtered)
    } else {
      setFilteredReviews(reviews)
    }
  }, [searchTerm, reviews])

  const handleDeleteReview = (id: string) => {
    setDeleteId(id)
  }

  const handleDeleteClose = () => {
    setDeleteId(null)
  }

  const handleDeleteConfirm = () => {
    fetchReviews()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <MessageSquare className="ml-3 h-8 w-8 text-teal-500" />
            مدیریت نظرات
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="جستجوی نظرات (بر اساس نام کاربر، محصول یا متن نظر)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
              <p className="mt-2 text-gray-500">در حال بارگذاری نظرات...</p>
            </div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-1">هیچ نظری یافت نشد</h3>
            <p className="text-gray-500">
              {searchTerm ? 'موردی با جستجوی شما یافت نشد' : 'هنوز هیچ نظری ثبت نشده است'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map(review => (
              <ReviewCard
                key={review.id}
                review={review}
                onDelete={handleDeleteReview}
              />
            ))}
          </div>
        )}
      </div>

      {deleteId && (
        <DeleteReviewConfirmation
          id={deleteId}
          onClose={handleDeleteClose}
          onDelete={handleDeleteConfirm}
        />
      )}
    </div>
  )
}