'use client'

import { useState, useEffect, useCallback } from 'react'
import { Article } from '@/types'
import { supabase } from '@/lib/supabase'
import ArticleCard from '@/components/ArticleCard'
import ArticleForm from '@/components/ArticleForm'
import DeleteArticleConfirmation from '@/components/DeleteArticleConfirmation'
import { Plus, Search } from 'lucide-react'

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setArticles(data || [])
      setFilteredArticles(data || [])
    } catch (error: unknown) {
      let errorMessage = 'خطایی در بارگذاری مقالات رخ داد';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error('Error fetching articles:', errorMessage);
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  useEffect(() => {
    if (searchTerm) {
      const filtered = articles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredArticles(filtered)
    } else {
      setFilteredArticles(articles)
    }
  }, [searchTerm, articles])

  const handleAddArticle = () => {
    setCurrentArticle(null)
    setShowForm(true)
  }

  const handleEditArticle = (article: Article) => {
    setCurrentArticle(article)
    setShowForm(true)
  }

  const handleDeleteArticle = (id: string) => {
    setDeleteId(id)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setCurrentArticle(null)
  }

  const handleFormSave = () => {
    fetchArticles()
  }

  const handleDeleteClose = () => {
    setDeleteId(null)
  }

  const handleDeleteConfirm = () => {
    fetchArticles()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">مدیریت مقالات</h1>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="جستجوی مقالات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <button
              onClick={handleAddArticle}
              className="flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <Plus className="h-5 w-5 ml-2" />
              افزودن مقاله
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <p className="mt-2 text-gray-500">در حال بارگذاری مقالات...</p>
            </div>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">هیچ مقاله‌ای یافت نشد</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'موردی با جستجوی شما یافت نشد' : 'شما هنوز هیچ مقاله‌ای اضافه نکرده‌اید'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddArticle}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-500 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Plus className="h-4 w-4 ml-2" />
                افزودن مقاله اول
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                onEdit={handleEditArticle}
                onDelete={handleDeleteArticle}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <ArticleForm
          article={currentArticle}
          onClose={handleFormClose}
          onSave={handleFormSave}
        />
      )}

      {deleteId && (
        <DeleteArticleConfirmation
          id={deleteId}
          onClose={handleDeleteClose}
          onDelete={handleDeleteConfirm}
        />
      )}
    </div>
  )
}