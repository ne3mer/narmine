'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { Icon } from '@/components/icons/Icon';
import Link from 'next/link';
import Image from 'next/image';
import { API_BASE_URL } from '@/lib/api';
import toast from 'react-hot-toast';

export default function GuestCheckoutPage() {
  const router = useRouter();
  const { cart, finalTotal, clearCart, totalPrice, shippingCost, shippingMethods, selectedShippingMethodId, setSelectedShippingMethodId } = useCart();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    province: '',
    city: '',
    address: '',
    postalCode: '',
    createAccount: false,
    password: ''
  });

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      router.push('/cart');
    }
  }, [cart, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedMethod = shippingMethods.find(m => m._id === selectedShippingMethodId);
      if (!selectedMethod) {
        throw new Error('لطفاً یک روش ارسال انتخاب کنید');
      }

      // 1. Create Order
      const orderData = {
        customerInfo: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone,
          shippingAddress: {
            province: formData.province,
            city: formData.city,
            address: formData.address,
            postalCode: formData.postalCode,
            recipientName: `${formData.firstName} ${formData.lastName}`.trim(),
            recipientPhone: formData.phone
          }
        },
        items: cart?.items.map(item => ({
          gameId: item.gameId.id,
          variantId: item.variantId,
          selectedOptions: item.selectedOptions,
          pricePaid: item.priceAtAdd,
          quantity: item.quantity
        })),
        totalAmount: finalTotal,
        paymentMethod: 'online', // Default to online payment
        shippingMethod: {
          id: selectedMethod._id,
          name: selectedMethod.name,
          price: shippingCost, // Use calculated cost (0 if free)
          eta: selectedMethod.eta
        }
      };

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'خطا در ثبت سفارش');
      }

      const { data: order } = await response.json();

      // 2. Create Account if requested
      if (formData.createAccount && formData.password) {
        try {
          await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: `${formData.firstName} ${formData.lastName}`.trim(),
              email: formData.email,
              password: formData.password,
              phone: formData.phone
            })
          });
          toast.success('حساب کاربری شما ایجاد شد');
        } catch (err) {
          console.error('Account creation failed:', err);
          toast.error('سفارش ثبت شد اما ایجاد حساب کاربری با مشکل مواجه شد');
        }
      }

      // 3. Clear Cart and Redirect
      await clearCart();
      toast.success('سفارش شما با موفقیت ثبت شد');
      router.push(`/checkout/success?orderId=${order._id}&orderNumber=${order.orderNumber}`);

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'خطا در ثبت سفارش');
    } finally {
      setLoading(false);
    }
  };

  if (!cart) return null;

  return (
    <div className="min-h-screen bg-[#f8f5f2] py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
          
          {/* Form Section */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-[#4a3f3a]">تسویه حساب مهمان</h1>
              <Link href="/auth/login" className="text-sm font-medium text-[#c9a896] hover:text-[#b08d79]">
                قبلاً ثبت‌نام کرده‌اید؟ وارد شوید
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl bg-white p-6 shadow-sm border border-[#c9a896]/20">
              
              {/* Contact Info */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-[#4a3f3a]">اطلاعات تماس</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#4a3f3a]">ایمیل</label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-[#c9a896]/30 bg-[#f8f5f2] px-4 py-3 outline-none focus:border-[#c9a896] focus:ring-2 focus:ring-[#c9a896]/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#4a3f3a]">شماره موبایل</label>
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-[#c9a896]/30 bg-[#f8f5f2] px-4 py-3 outline-none focus:border-[#c9a896] focus:ring-2 focus:ring-[#c9a896]/20"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-[#c9a896]/20 pt-6"></div>

              {/* Shipping Address */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-[#4a3f3a]">آدرس ارسال</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#4a3f3a]">نام</label>
                    <input
                      required
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-[#c9a896]/30 bg-[#f8f5f2] px-4 py-3 outline-none focus:border-[#c9a896] focus:ring-2 focus:ring-[#c9a896]/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#4a3f3a]">نام خانوادگی</label>
                    <input
                      required
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-[#c9a896]/30 bg-[#f8f5f2] px-4 py-3 outline-none focus:border-[#c9a896] focus:ring-2 focus:ring-[#c9a896]/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#4a3f3a]">استان</label>
                    <input
                      required
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-[#c9a896]/30 bg-[#f8f5f2] px-4 py-3 outline-none focus:border-[#c9a896] focus:ring-2 focus:ring-[#c9a896]/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#4a3f3a]">شهر</label>
                    <input
                      required
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-[#c9a896]/30 bg-[#f8f5f2] px-4 py-3 outline-none focus:border-[#c9a896] focus:ring-2 focus:ring-[#c9a896]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-[#4a3f3a]">آدرس پستی</label>
                  <textarea
                    required
                    rows={3}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-[#c9a896]/30 bg-[#f8f5f2] px-4 py-3 outline-none focus:border-[#c9a896] focus:ring-2 focus:ring-[#c9a896]/20"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-[#4a3f3a]">کد پستی</label>
                  <input
                    required
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-[#c9a896]/30 bg-[#f8f5f2] px-4 py-3 outline-none focus:border-[#c9a896] focus:ring-2 focus:ring-[#c9a896]/20"
                  />
                </div>
              </div>

              <div className="border-t border-[#c9a896]/20 pt-6"></div>

              {/* Shipping Method Selection */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-[#4a3f3a]">روش ارسال</h2>
                <div className="grid gap-4">
                  {shippingMethods.map((method) => {
                    const isFree = method.freeThreshold && totalPrice >= method.freeThreshold;
                    const cost = isFree ? 0 : method.price;
                    
                    return (
                      <label
                        key={method._id}
                        className={`relative flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                          selectedShippingMethodId === method._id
                            ? 'border-[#c9a896] bg-[#f8f5f2] shadow-sm'
                            : 'border-[#c9a896]/20 hover:border-[#c9a896]/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shippingMethod"
                            value={method._id}
                            checked={selectedShippingMethodId === method._id}
                            onChange={() => setSelectedShippingMethodId(method._id)}
                            className="h-5 w-5 border-gray-300 text-[#c9a896] focus:ring-[#c9a896]"
                          />
                          <div>
                            <span className="block font-bold text-[#4a3f3a]">{method.name}</span>
                            {method.eta && (
                              <span className="text-sm text-[#4a3f3a]/70">{method.eta}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`block font-bold ${cost === 0 ? 'text-green-600' : 'text-[#4a3f3a]'}`}>
                            {cost === 0 ? 'رایگان' : `${cost.toLocaleString('fa-IR')} تومان`}
                          </span>
                          {isFree && (
                            <span className="text-xs text-green-600">ارسال رایگان سفارش‌های بالای {method.freeThreshold?.toLocaleString('fa-IR')}</span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                  
                  {shippingMethods.length === 0 && (
                    <div className="rounded-xl border border-dashed border-gray-300 p-4 text-center text-gray-500">
                      هیچ روش ارسالی موجود نیست.
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-[#c9a896]/20 pt-6"></div>

              {/* Account Creation Option */}
              <div className="space-y-4 rounded-xl bg-[#f8f5f2] p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="createAccount"
                    checked={formData.createAccount}
                    onChange={handleInputChange}
                    className="h-5 w-5 rounded border-gray-300 text-[#c9a896] focus:ring-[#c9a896]"
                  />
                  <span className="font-medium text-[#4a3f3a]">اطلاعات من را برای خریدهای بعدی ذخیره کن (ایجاد حساب کاربری)</span>
                </label>

                {formData.createAccount && (
                  <div className="animate-fadeIn">
                    <label className="mb-1 block text-sm font-medium text-[#4a3f3a]">رمز عبور</label>
                    <input
                      required
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="یک رمز عبور امن انتخاب کنید"
                      className="w-full rounded-xl border border-[#c9a896]/30 bg-white px-4 py-3 outline-none focus:border-[#c9a896] focus:ring-2 focus:ring-[#c9a896]/20"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#4a3f3a] py-4 text-lg font-bold text-white transition-all hover:bg-[#c9a896] disabled:opacity-50"
              >
                {loading ? 'در حال پردازش...' : `ثبت سفارش و پرداخت (${finalTotal.toLocaleString('fa-IR')} تومان)`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-[#c9a896]/20">
              <h2 className="mb-6 text-xl font-bold text-[#4a3f3a]">خلاصه سفارش</h2>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex gap-4 border-b border-[#c9a896]/10 pb-4 last:border-0">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-[#c9a896]/20">
                      {item.gameId.coverUrl ? (
                        <Image
                          src={item.gameId.coverUrl}
                          alt={item.gameId.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100">
                          <Icon name="image" className="text-gray-400" />
                        </div>
                      )}
                      <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#c9a896] text-xs font-bold text-white shadow-sm">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <h3 className="font-bold text-[#4a3f3a]">{item.gameId.title}</h3>
                      <p className="text-sm text-[#4a3f3a]/70">
                        {item.priceAtAdd.toLocaleString('fa-IR')} تومان
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 space-y-3 border-t border-[#c9a896]/20 pt-6">
                <div className="flex justify-between text-[#4a3f3a]/70">
                  <span>جمع کل کالاها</span>
                  <span>{totalPrice.toLocaleString('fa-IR')} تومان</span>
                </div>
                <div className="flex justify-between text-[#4a3f3a]/70">
                  <span>هزینه ارسال</span>
                  <span>{shippingCost === 0 ? 'رایگان' : `${shippingCost.toLocaleString('fa-IR')} تومان`}</span>
                </div>
                <div className="flex justify-between border-t border-[#c9a896]/20 pt-3 text-xl font-bold text-[#4a3f3a]">
                  <span>مبلغ قابل پرداخت</span>
                  <span>{finalTotal.toLocaleString('fa-IR')} تومان</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
