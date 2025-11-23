import { formatToman } from '@/lib/format';
import { type ShippingMethodContent, defaultHomeContent } from '@/data/homeContent';

type ShippingExperienceProps = {
  methods?: ShippingMethodContent[];
};

const formatPriceLabel = (method: ShippingMethodContent) => {
  if (method.price === 0 || method.priceLabel === 'رایگان') {
    return 'رایگان';
  }
  return `${formatToman(method.price)} تومان`;
};

export const ShippingExperience = ({ methods = defaultHomeContent.shippingMethods }: ShippingExperienceProps) => {
  if (!methods || methods.length === 0) return null;

  return (
    <div className="rounded-3xl border border-[#c9a896]/30 bg-gradient-to-br from-white via-[#fefaf6] to-[#f5ebe3] p-8 shadow-xl">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#8b6f47]">SHIPPING EXPERIENCE</p>
          <h2 className="mt-3 font-serif text-3xl text-[#4a3f3a]" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
            روش‌های ارسال نرمینه خواب
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#4a3f3a]/70">
            متناسب با سبک زندگی خود، تجربه ارسال لوکس یا اقتصادی را انتخاب کنید. تمام روش‌ها با بسته‌بندی محافظ و
            پیگیری آنلاین ارائه می‌شوند.
          </p>
        </div>
        <div className="rounded-2xl bg-white/80 px-5 py-3 text-sm text-[#4a3f3a]/70 shadow-inner">
          <p>به‌روزرسانی توسط تیم تجربه مشتری</p>
          <p className="mt-1 font-semibold text-[#4a3f3a]">قابل ویرایش از پنل مدیریت</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {methods.map((method) => {
          const isHighlight = method.highlight ?? false;
          const freeWithThreshold =
            method.freeThreshold && method.freeThreshold > 0 ? method.freeThreshold : undefined;

          return (
            <div
              key={method.id}
              className={`relative overflow-hidden rounded-2xl border-2 p-6 transition-all ${
                isHighlight
                  ? 'border-transparent bg-gradient-to-br from-[#4a3f3a] to-[#c9a896] text-white shadow-2xl'
                  : 'border-[#eadbd0] bg-white text-[#4a3f3a]'
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${
                      isHighlight ? 'bg-white/10' : 'bg-[#fdf6ef]'
                    }`}
                  >
                    {method.icon ?? '🚚'}
                  </div>
                  <div>
                    <p className="font-serif text-xl font-semibold">{method.name}</p>
                    <p className={`text-xs ${isHighlight ? 'text-white/80' : 'text-[#4a3f3a]/60'}`}>{method.eta}</p>
                  </div>
                </div>
                {method.badge && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isHighlight ? 'bg-white/20 text-white' : 'bg-[#f7e9df] text-[#a6785d]'
                    }`}
                  >
                    {method.badge}
                  </span>
                )}
              </div>
              <p className={`text-sm leading-relaxed ${isHighlight ? 'text-white/85' : 'text-[#4a3f3a]/80'}`}>
                {method.description}
              </p>
              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className={`text-xs ${isHighlight ? 'text-white/70' : 'text-[#4a3f3a]/60'}`}>هزینه ارسال</p>
                  <p className="text-2xl font-bold">{formatPriceLabel(method)}</p>
                  {freeWithThreshold && (
                    <p className={`text-xs ${isHighlight ? 'text-white/70' : 'text-[#4a3f3a]/60'}`}>
                      رایگان برای سفارش‌های بالای {formatToman(freeWithThreshold)} تومان
                    </p>
                  )}
                </div>
              </div>

              {method.perks && method.perks.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2 text-xs">
                  {method.perks.map((perk) => (
                    <span
                      key={perk}
                      className={`rounded-full px-3 py-1 ${
                        isHighlight ? 'bg-white/15 text-white' : 'bg-[#f3ebe3] text-[#4a3f3a]'
                      }`}
                    >
                      {perk}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
