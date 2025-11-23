'use client';

import { Icon } from '@/components/icons/Icon';
import type { AdminOrder } from '@/types/admin';

interface OrderTrackingTimelineProps {
  order: AdminOrder;
}

type OrderStage = {
  id: string;
  label: string;
  icon: string;
  status: 'completed' | 'current' | 'pending';
};

const getOrderStages = (order: AdminOrder): OrderStage[] => {
  const { paymentStatus, fulfillmentStatus } = order;
  
  // Determine if this is a physical order
  const hasPhysicalItems = order.items.some(
    item => item.productType && item.productType !== 'digital_game' && item.productType !== 'digital_content'
  );

  if (hasPhysicalItems) {
    // Physical order flow: Payment -> Processing -> Shipped -> Delivered
    return [
      {
        id: 'payment',
        label: 'پرداخت',
        icon: 'credit-card',
        status: paymentStatus === 'paid' ? 'completed' : paymentStatus === 'pending' ? 'current' : 'pending'
      },
      {
        id: 'processing',
        label: 'در حال آماده‌سازی',
        icon: 'package',
        status: paymentStatus === 'paid' && (fulfillmentStatus === 'pending' || fulfillmentStatus === 'assigned') 
          ? 'current' 
          : paymentStatus === 'paid' && fulfillmentStatus === 'delivered' 
          ? 'completed' 
          : 'pending'
      },
      {
        id: 'shipped',
        label: 'ارسال شده',
        icon: 'truck',
        status: fulfillmentStatus === 'assigned' 
          ? 'current' 
          : fulfillmentStatus === 'delivered' 
          ? 'completed' 
          : 'pending'
      },
      {
        id: 'delivered',
        label: 'تحویل داده شد',
        icon: 'check',
        status: fulfillmentStatus === 'delivered' ? 'completed' : 'pending'
      }
    ];
  } else {
    // Digital order flow: Payment -> Processing -> Sent
    return [
      {
        id: 'payment',
        label: 'پرداخت',
        icon: 'credit-card',
        status: paymentStatus === 'paid' ? 'completed' : paymentStatus === 'pending' ? 'current' : 'pending'
      },
      {
        id: 'processing',
        label: 'در حال پردازش',
        icon: 'clock',
        status: paymentStatus === 'paid' && fulfillmentStatus === 'pending' 
          ? 'current' 
          : paymentStatus === 'paid' && fulfillmentStatus === 'delivered' 
          ? 'completed' 
          : 'pending'
      },
      {
        id: 'delivered',
        label: 'ارسال شد',
        icon: 'check',
        status: fulfillmentStatus === 'delivered' ? 'completed' : 'pending'
      }
    ];
  }
};

export function OrderTrackingTimeline({ order }: OrderTrackingTimelineProps) {
  const stages = getOrderStages(order);
  const currentStageIndex = stages.findIndex(s => s.status === 'current');
  const completedCount = stages.filter(s => s.status === 'completed').length;
  const progressPercentage = (completedCount / stages.length) * 100;

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">پیگیری سفارش</h3>
          <p className="text-xs text-slate-500">شماره سفارش: {order.orderNumber}</p>
        </div>
        <div className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-600">
          {completedCount}/{stages.length} مرحله
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute right-6 top-0 h-full w-0.5 bg-slate-200" />

        {/* Stages */}
        <div className="space-y-6">
          {stages.map((stage, index) => (
            <div key={stage.id} className="relative flex items-start gap-4">
              {/* Icon */}
              <div className={`relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full transition-all ${
                stage.status === 'completed' 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                  : stage.status === 'current'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 animate-pulse'
                  : 'bg-slate-100 text-slate-400'
              }`}>
                <Icon name={stage.icon as any} size={20} />
              </div>

              {/* Content */}
              <div className="flex-1 pb-2">
                <h4 className={`font-bold ${
                  stage.status === 'completed' || stage.status === 'current' 
                    ? 'text-slate-900' 
                    : 'text-slate-400'
                }`}>
                  {stage.label}
                </h4>
                
                {stage.status === 'current' && (
                  <p className="mt-1 text-xs text-blue-600 font-medium">در حال انجام...</p>
                )}
                
                {stage.status === 'completed' && index === currentStageIndex - 1 && order.deliveryInfo?.deliveredAt && (
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(order.deliveryInfo.deliveredAt).toLocaleString('fa-IR')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Info */}
      {order.deliveryInfo?.message && (
        <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Icon name="info" size={16} className="text-emerald-600" />
            <p className="text-sm font-bold text-emerald-900">اطلاعات تحویل</p>
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-emerald-800">
            {order.deliveryInfo.message}
          </p>
        </div>
      )}
    </div>
  );
}
