'use client'
import Image from 'next/image';
import { useState, useEffect, Fragment } from 'react'
import { supabase } from '@/lib/supabase'
import { OrderWithDetails } from '@/types'
import { 
  ShoppingBag, 
  MapPin, 
  Phone, 
  User, 
  Package, 
  ChevronDown, 
  ChevronUp,
  Bell,
  Clock
} from 'lucide-react'
import Link from 'next/link'

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    fetchOrders()
    checkNotificationPermission()
  }, [])

  // --- تابع دریافت دسترسی نوتیفیکیشن ---
  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      if (permission === 'granted') {
        new Notification('دسترسی تایید شد', { body: 'حالا می‌توانید به مشتریان نوتیفیکیشن ارسال کنید.' })
      }
    }
  }

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          addresses ( full_name, phone, address, postal_code ),
          order_items (
            quantity,
            price,
            products ( name, image_url )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      alert('خطا در دریافت اطلاعات سفارشات')
    } finally {
      setLoading(false)
    }
  }

  // --- تابع محاسبه زمان نسبی (اصلاح شده) ---
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'همین الان'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} دقیقه پیش`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ساعت پیش`
    if (diffInSeconds < 172800) return 'دیروز'
    return new Intl.DateTimeFormat('fa-IR').format(date) // اصلاح شده
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: 'IRR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      paid: 'bg-green-100 text-green-800 border-green-200',
      shipped: 'bg-blue-100 text-blue-800 border-blue-200',
      delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    }
    const labels: Record<string, string> = {
      pending: 'در انتظار',
      paid: 'پرداخت شده',
      shipped: 'ارسال شده',
      delivered: 'تحویل',
      cancelled: 'لغو شده',
    }
    
    const badgeStyle = styles[status] || 'bg-gray-100 text-gray-800'
    const label = labels[status] || status

    return (
      <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${badgeStyle}`}>
        {label}
      </span>
    )
  }

  const handleSendNotification = async (customerName: string, orderId: string) => {
    console.log(`Sending push notification to user for order ${orderId}`)
    
    if (notificationPermission !== 'granted') {
      alert('برای تست ارسال، ابتدا باید به مرورگر خود اجازه دهید.')
      return
    }

    new Notification(`سفارش برای ${customerName}`, {
      body: 'پیامک/نوتیفیکیشن با موفقیت به موبایل مشتری ارسال شد.',
      icon: '/logo.png'
    })
    
    alert('دستور ارسال نوتیفیکیشن به سرور ارسال شد. (نمایش تست)')
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <ShoppingBag className="ml-2 h-6 w-6 text-blue-600" />
            لیست سفارشات
          </h1>
          <div className="flex gap-2">
             <button 
                onClick={requestNotificationPermission}
                className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  notificationPermission === 'granted' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Bell className="w-3 h-3 ml-1" />
                {notificationPermission === 'granted' ? 'دسترسی فعال' : 'فعال‌سازی نوتیفیکیشن'}
              </button>
            <Link 
              href="/" 
              className="text-sm text-gray-500 hover:text-blue-600 border border-gray-300 px-3 py-1.5 rounded-lg bg-white"
            >
              بازگشت
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">سفارشی یافت نشد</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 w-20">#</th>
                    <th className="px-4 py-3">مشتری / آدرس</th>
                    <th className="px-4 py-3 w-32">وضعیت</th>
                    <th className="px-4 py-3 w-32">مبلغ کل</th>
                    <th className="px-4 py-3 w-32">زمان ثبت</th>
                    <th className="px-4 py-3 w-16 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order, index) => (
                    <Fragment key={order.id}>
                      <tr 
                        className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${expandedOrderId === order.id ? 'bg-blue-50/80' : ''}`}
                        onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                      >
                        <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-gray-800 text-sm">
                            {order.addresses?.full_name || 'کاربر حذف شده'}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {order.addresses?.address}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-700">
                          {formatPrice(order.total_amount)}
                        </td>
                        <td className="px-4 py-3 text-gray-500 flex items-center gap-1">
                           <Clock className="w-3 h-3" />
                           {getRelativeTime(order.created_at)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {expandedOrderId === order.id ? (
                            <ChevronUp className="w-5 h-5 mx-auto text-gray-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 mx-auto text-gray-400" />
                          )}
                        </td>
                      </tr>

                      {expandedOrderId === order.id && (
                        <tr className="bg-gray-50/50 animate-fadeIn">
                          <td colSpan={6} className="px-4 py-6 border-t border-dashed border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                              
                              <div className="md:col-span-4 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center">
                                  <MapPin className="w-3 h-3 ml-1" />
                                      اطلاعات تماس و گیرنده
                                </h4>
                                {order.addresses ? (
                                  <ul className="space-y-2 text-sm text-gray-700">
                                    <li className="flex justify-between">
                                      <span>نام:</span>
                                      <span className="font-medium">{order.addresses.full_name}</span>
                                    </li>
                                    <li className="flex justify-between">
                                      <span>تلفن:</span>
                                      <span className="font-mono dir-ltr">{order.addresses.phone}</span>
                                    </li>
                                    <li className="flex justify-between">
                                      <span>کد پستی:</span>
                                      <span className="font-mono dir-ltr">{order.addresses.postal_code}</span>
                                    </li>
                                    <li className="pt-2 border-t border-gray-100 text-xs text-gray-600 leading-relaxed">
                                      {order.addresses.address}
                                    </li>
                                  </ul>
                                ) : (
                                  <p className="text-red-400 text-sm">آدرس یافت نشد</p>
                                )}
                              </div>

                              <div className="md:col-span-8">
                                <div className="flex justify-between items-center mb-3">
                                  <h4 className="text-xs font-bold text-gray-400 uppercase flex items-center">
                                    <Package className="w-3 h-3 ml-1" />
                                    کالاهای سفارش داده شده ({order.order_items.length})
                                  </h4>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleSendNotification(order.addresses?.full_name || 'کاربر', order.id)
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg shadow-sm transition-transform active:scale-95"
                                  >
                                    <Bell className="w-3 h-3" />
                                    ارسال پیامک/نوتیف
                                  </button>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                  <table className="w-full text-xs">
                                    <thead className="bg-gray-50 text-gray-500">
                                      <tr>
                                        <th className="px-3 py-2 text-right">محصول</th>
                                        <th className="px-3 py-2 text-center">تعداد</th>
                                        <th className="px-3 py-2 text-left">قیمت واحد</th>
                                        <th className="px-3 py-2 text-left">جمع</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                      {order.order_items.map((item, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                          <td className="px-3 py-2">
                                            <div className="flex items-center gap-2">
                                             
                                              <span className="font-medium text-gray-700 line-clamp-1 max-w-[150px]">
                                                {item.products.name}
                                              </span>
                                            </div>
                                          </td>
                                          <td className="px-3 py-2 text-center text-gray-600">
                                            {item.quantity}
                                          </td>
                                          <td className="px-3 py-2 text-left text-gray-500">
                                            {formatPrice(item.price)}
                                          </td>
                                          <td className="px-3 py-2 text-left font-bold text-gray-800">
                                            {formatPrice(item.price * item.quantity)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}