// types.ts

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  discount_percentage: number
  category_id: string | null
  stock_quantity: number
  is_featured: boolean
  is_bestseller: boolean
  image_url: string | null
  average_rating: number
  total_reviews: number
  total_likes: number
  created_at: string
  brand_id : string | null
}

export interface User {
  id: string
  email: string
  display_name?: string
  created_at: string
  phone?: string
  first_name?: string
  last_name?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
}

export interface Brand {
  id: string
  name: string
  slug: string
  logo_url: string | null
  description: string | null
  created_at: string
}

// --- نوع داده جدید برای نظرات ---
export interface Review {
  id: string
  user_id: string
  product_id: string
  rating: number
  comment: string
  created_at: string
  // اطلاعات کاربر که از طریق join دریافت می‌شود
  user: {
    display_name?: string
    first_name?: string
    last_name?: string
    email: string
  }
  // اطلاعات محصول که از طریق join دریافت می‌شود
  product: {
    name: string
  }
}

export interface Article {
  id: string
  title: string
  slug: string
  content: string
  total_likes: number
  created_at: string
  image_url : string
}


