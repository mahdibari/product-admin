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

export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
}

export interface Ticket {
  id: string
  user_id: string
  subject: string
  status: 'open' | 'closed' | 'awaiting_user'
  created_at: string
  // برای نمایش نام کاربر، این فیلد را به صورت دستی اضافه می‌کنیم
  user?: {
    display_name: string | null
  }
}

export interface TicketMessage {
  id: string
  ticket_id: string
  user_id: string | null
  admin_reply: Text
  content: string
  created_at: string
  // برای نمایش نام کاربر، این فیلد را به صورت دستی اضافه می‌کنیم
  user?: {
    display_name: string | null
  }
}


// ... (تایپ‌های قبلی)

// --- تایپ جدید برای مقالات ---
export interface Article {
  id: string
  title: string
  slug: string
  content: string
  total_likes: number
  created_at: string
}

export interface Brand {
  id: string
  name: string
  slug: string
  logo_url: string | null
  description: string | null
  created_at: string
}