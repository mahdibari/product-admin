'use client'
import Image from 'next/image';
import { useState, useEffect, Fragment } from 'react'
import { supabase } from '@/lib/supabase'
import { OrderWithDetails } from '@/types'
import { 
  ShoppingBag, MapPin, Phone, User, Package, ChevronDown, ChevronUp,
  Bell, Clock, Search, Save, CheckCircle2, Truck
} from 'lucide-react'
import Link from 'next/link'

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  
  // فیلتر جستجو
  const [searchTerm, setSearchTerm] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
    checkNotificationPermission()
  }, [])

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
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
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // متد جدید برای ذخیره فیلدهای درخواستی شما
  const handleUpdateAdminFields = async (order: any) => {
    setUpdatingId(order.id)
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          preparing_done: order.preparing_done,
          shipping_done: order.shipping_done,
          delivery_done: order.delivery_done,
          tracking_code: order.tracking_code,
          current_step_description: order.current_step_description
        })
        .eq('id', order.id)

      if (error) throw error

      if (order.history_desc) {
        await supabase.from('order_status_history').insert({
          order_id: order.id,
          status_title: 'بروزرسانی وضعیت',
          description: order.history_desc
        })
      }
      alert('تغییرات با موفقیت ذخیره شد')
    } catch (err) {
      alert('خطا در بروزرسانی')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleFieldChange = (orderId: string, field: string, value: any) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, [field]: value } : o))
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diffInSeconds < 60) return 'همین الان'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} دقیقه پیش`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ساعت پیش`
    return new Intl.DateTimeFormat('fa-IR').format(date)
  }

  // فقط تغییر متن به تومان بدون تغییر در عدد
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان'
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
      pending: 'در انتظار', paid: 'پرداخت شده', shipped: 'ارسال شده', delivered: 'تحویل', cancelled: 'لغو شده',
    }
    return (
      <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    )
  }

  // فیلتر کردن سفارشات بر اساس سرچ
  const filteredOrders = orders.filter(o => 
    o.trans_id?.includes(searchTerm) || 
    o.addresses?.full_name?.includes(searchTerm) || 
    o.addresses?.phone?.includes(searchTerm)
  )

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6">
        
        {/* هدر قبلی + فیلد سرچ جدید */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <ShoppingBag className="ml-2 h-6 w-6 text-blue-600" /> لیست سفارشات
          </h1>
          
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="جستجو (نام/تلفن/تراکنش)"
                className="pr-8 pl-3 py-1.5 rounded-lg border border-gray-300 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={requestNotificationPermission} className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${notificationPermission === 'granted' ? 'bg-green-100 text-green-700' : 'bg-gray-200'}`}>
              <Bell className="w-3 h-3 ml-1" /> {notificationPermission === 'granted' ? 'دسترسی فعال' : 'فعال‌سازی نوتیف'}
            </button>
            <Link href="/" className="text-sm text-gray-500 border border-gray-300 px-3 py-1.5 rounded-lg bg-white">بازگشت</Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 w-10">#</th>
                    <th className="px-4 py-3">مشتری / آدرس</th>
                    <th className="px-4 py-3 w-32">وضعیت</th>
                    <th className="px-4 py-3 w-32">مبلغ کل</th>
                    <th className="px-4 py-3 w-32">زمان ثبت</th>
                    <th className="px-4 py-3 w-16 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order, index) => (
                    <Fragment key={order.id}>
                      <tr 
                        className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${expandedOrderId === order.id ? 'bg-blue-50/80' : ''}`}
                        onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                      >
                        <td className="px-4 py-3 text-xs text-gray-400">{index + 1}</td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-gray-800 text-sm">{order.addresses?.full_name || 'کاربر'}</div>
                          <div className="text-[10px] text-gray-400 truncate max-w-[200px]">{order.addresses?.address}</div>
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                        <td className="px-4 py-3 font-bold">{formatPrice(order.total_amount)}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{getRelativeTime(order.created_at)}</td>
                        <td className="px-4 py-3 text-center">
                          {expandedOrderId === order.id ? <ChevronUp className="w-4 h-4 mx-auto" /> : <ChevronDown className="w-4 h-4 mx-auto" />}
                        </td>
                      </tr>

                      {expandedOrderId === order.id && (
                        <tr className="bg-gray-50/50">
                          <td colSpan={6} className="px-4 py-6 border-t border-dashed border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                              
                              {/* بخش جدید: مدیریت وضعیت که خواستید اضافه شود */}
                              <div className="md:col-span-12 bg-white p-4 rounded-xl border border-gray-200 mb-4 shadow-sm">
                                <h4 className="text-xs font-bold text-blue-600 mb-4 flex items-center gap-2">
                                  <Package size={14}/> پنل مدیریت و تغییر وضعیت سفارش
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                  <label className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg cursor-pointer">
                                    <input type="checkbox" checked={order.preparing_done} onChange={(e) => handleFieldChange(order.id, 'preparing_done', e.target.checked)} />
                                    <span className="text-xs">آماده‌سازی (Preparing)</span>
                                  </label>
                                  <label className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg cursor-pointer">
                                    <input type="checkbox" checked={order.shipping_done} onChange={(e) => handleFieldChange(order.id, 'shipping_done', e.target.checked)} />
                                    <span className="text-xs">ارسال شد (Shipping)</span>
                                  </label>
                                  <label className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg cursor-pointer">
                                    <input type="checkbox" checked={order.delivery_done} onChange={(e) => handleFieldChange(order.id, 'delivery_done', e.target.checked)} />
                                    <span className="text-xs">تحویل شد (Delivered)</span>
                                  </label>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <input 
                                    type="text" placeholder="کد رهگیری پستی" className="p-2 border rounded text-xs outline-none focus:border-blue-500"
                                    value={order.tracking_code || ''} onChange={(e) => handleFieldChange(order.id, 'tracking_code', e.target.value)}
                                  />
                                  <input 
                                    type="text" placeholder="توضیح مرحله فعلی (Step Description)" className="p-2 border rounded text-xs outline-none focus:border-blue-500"
                                    value={order.current_step_description || ''} onChange={(e) => handleFieldChange(order.id, 'current_step_description', e.target.value)}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <textarea 
                                    placeholder="افزودن توضیحات به تاریخچه (Order Status History)..." className="flex-grow p-2 border rounded text-xs h-10 outline-none"
                                    onChange={(e) => handleFieldChange(order.id, 'history_desc', e.target.value)}
                                  />
                                  <button 
                                    onClick={() => handleUpdateAdminFields(order)} disabled={updatingId === order.id}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-2"
                                  >
                                    <Save size={14}/> {updatingId === order.id ? 'صبور باشید...' : 'ذخیره وضعیت'}
                                  </button>
                                </div>
                              </div>

                              {/* اطلاعات تماس قبلی خودت */}
                              <div className="md:col-span-4 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center"><MapPin className="w-3 h-3 ml-1" /> آدرس و تماس</h4>
                                {order.addresses && (
                                  <ul className="space-y-2 text-sm text-gray-700">
                                    <li className="flex justify-between"><span>نام:</span><span className="font-medium">{order.addresses.full_name}</span></li>
                                    <li className="flex justify-between"><span>تلفن:</span><span className="font-mono">{order.addresses.phone}</span></li>
                                    <li className="pt-2 border-t text-xs text-gray-600 leading-relaxed">{order.addresses.address}</li>
                                  </ul>
                                )}
                              </div>

                              {/* اقلام سفارش قبلی خودت */}
                              <div className="md:col-span-8">
                                <div className="flex justify-between items-center mb-3">
                                  <h4 className="text-xs font-bold text-gray-400 flex items-center"><Package className="w-3 h-3 ml-1" /> کالاها ({order.order_items.length})</h4>
                                  <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg shadow-sm">
                                    <Bell className="w-3 h-3" /> ارسال نوتیف
                                  </button>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                  <table className="w-full text-xs text-right">
                                    <thead className="bg-gray-50 text-gray-500">
                                      <tr><th className="px-3 py-2">محصول</th><th className="px-3 py-2 text-center">تعداد</th><th className="px-3 py-2">قیمت</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                      {order.order_items.map((item: any, i: number) => (
                                        <tr key={i}><td className="px-3 py-2 font-medium">{item.products.name}</td><td className="px-3 py-2 text-center">{item.quantity}</td><td className="px-3 py-2">{formatPrice(item.price)}</td></tr>
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