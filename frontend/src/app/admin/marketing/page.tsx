'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CreativeBanner } from '@/components/sections/CreativeBanner';
import { defaultBannerContent, type BannerContent } from '@/data/marketing';
import { API_BASE_URL, ADMIN_API_KEY, adminHeaders } from '@/lib/api';
import { Icon } from '@/components/icons/Icon';

type CampaignStatus = 'active' | 'paused' | 'draft';

type Campaign = {
  id: string;
  name: string;
  channel: string;
  status: CampaignStatus;
  budget: number;
  ctr: number;
  cvr: number;
  startDate: string;
  endDate: string;
};

const parseList = (value: string) =>
  value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

const statusStyles: Record<CampaignStatus, string> = {
  active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  paused: 'bg-amber-50 text-amber-600 border-amber-100',
  draft: 'bg-slate-50 text-slate-500 border-slate-100'
};

const initialCampaigns: Campaign[] = [
  {
    id: 'cmp-hero',
    name: 'لانچ PS5 HDR Drop',
    channel: 'تلگرام',
    status: 'active',
    budget: 48,
    ctr: 5.1,
    cvr: 2.4,
    startDate: '1403/10/01',
    endDate: '1403/10/15'
  },
  {
    id: 'cmp-instagram',
    name: 'کاروسل اینستاگرام Winter',
    channel: 'اینستاگرام',
    status: 'paused',
    budget: 32,
    ctr: 3.2,
    cvr: 1.4,
    startDate: '1403/09/15',
    endDate: '1403/09/30'
  },
  {
    id: 'cmp-email',
    name: 'ایمیل Safe Account VIP',
    channel: 'ایمیل',
    status: 'draft',
    budget: 18,
    ctr: 6.4,
    cvr: 4.1,
    startDate: '1403/10/20',
    endDate: '1403/11/01'
  }
];

type MetricWithTrend = {
  current: number;
  previous: number;
};

type MarketingMetrics = {
  ctr: MetricWithTrend;
  cvr: MetricWithTrend;
  cac: MetricWithTrend;
  roi: MetricWithTrend;
  totalOrders: number;
  paidOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  totalSpend: number;
};

const channelOptions = ['تلگرام', 'اینستاگرام', 'ایمیل', 'SMS', 'وبلاگ'];

type UTMState = {
  baseUrl: string;
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
};

type MarketingSettings = {
  bannerContent: BannerContent;
  campaigns: Campaign[];
  utmBuilder: UTMState;
  experimentSplit: number;
};

type MarketingApiResponse = {
  settings: MarketingSettings;
  metrics: MarketingMetrics;
};

const initialUtm: UTMState = {
  baseUrl: 'https://gameclub.ir',
  source: 'telegram',
  medium: 'social',
  campaign: 'ps5-q4-drop',
  term: '',
  content: 'hero-banner'
};

export default function MarketingPage() {
  const [bannerContent, setBannerContent] = useState<BannerContent>(defaultBannerContent);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [utmBuilder, setUtmBuilder] = useState<UTMState>(initialUtm);
  const [copied, setCopied] = useState(false);
  const [experimentSplit, setExperimentSplit] = useState(60);
  const [metrics, setMetrics] = useState<MarketingMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('');

  const fetchMarketingData = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    setStatusMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/marketing`);
      if (!response.ok) {
        throw new Error('دریافت داده‌های بازاریابی با خطا مواجه شد.');
      }
      const json = await response.json();
      const data = json.data as MarketingApiResponse;
      if (data?.settings) {
        setBannerContent(data.settings.bannerContent ?? defaultBannerContent);
        setCampaigns(
          (data.settings.campaigns ?? initialCampaigns).map((campaign) => ({
            ...campaign,
            ctr: campaign.ctr ?? 0,
            cvr: campaign.cvr ?? 0,
            budget: campaign.budget ?? 0
          }))
        );
        const builder = data.settings.utmBuilder ?? initialUtm;
        setUtmBuilder({
          baseUrl: builder.baseUrl ?? initialUtm.baseUrl,
          source: builder.source ?? initialUtm.source,
          medium: builder.medium ?? initialUtm.medium,
          campaign: builder.campaign ?? initialUtm.campaign,
          term: builder.term ?? '',
          content: builder.content ?? ''
        });
        setExperimentSplit(data.settings.experimentSplit ?? 60);
      }
      if (data?.metrics) {
        setMetrics(data.metrics);
      }
      setLastSyncedAt(new Date().toLocaleString('fa-IR'));
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'امکان اتصال به سرور وجود ندارد.');
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchMarketingData();
  }, []);

  const saveMarketingSettings = async (payload: Partial<MarketingSettings>, sectionLabel: string) => {
    if (!ADMIN_API_KEY) {
      setStatusMessage('برای ذخیره تغییرات، کلید NEXT_PUBLIC_ADMIN_API_KEY را تنظیم کنید.');
      return;
    }
    setSavingSection(sectionLabel);
    try {
      const response = await fetch(`${API_BASE_URL}/api/marketing`, {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.message || `ذخیره ${sectionLabel} با خطا مواجه شد.`);
      }
      setStatusMessage(`تغییرات ${sectionLabel} ذخیره شد.`);
      await fetchMarketingData(true);
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'ذخیره تغییرات با خطا مواجه شد.');
    } finally {
      setSavingSection(null);
    }
  };

  const handleBannerChange = (field: keyof BannerContent, value: string) => {
    setBannerContent((prev) => ({ ...prev, [field]: value }));
  };

  const handlePerkChange = (value: string) => {
    setBannerContent((prev) => ({ ...prev, perks: parseList(value) }));
  };

  const handleCampaignChange = <K extends keyof Campaign>(id: string, field: K, value: Campaign[K]) => {
    setCampaigns((prev) => prev.map((campaign) => (campaign.id === id ? { ...campaign, [field]: value } : campaign)));
  };

  const handleAddCampaign = () => {
    setCampaigns((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: 'کمپین جدید',
        channel: 'تلگرام',
        status: 'draft',
        budget: 15,
        ctr: 0,
        cvr: 0,
        startDate: '1403/11/01',
        endDate: '1403/11/10'
      }
    ]);
  };

  const handleRemoveCampaign = (id: string) => {
    setCampaigns((prev) => prev.filter((campaign) => campaign.id !== id));
  };

  const handleSaveCampaigns = () => saveMarketingSettings({ campaigns }, 'کمپین‌ها');
  const handleSaveBanner = () => saveMarketingSettings({ bannerContent }, 'بنر خلاق');
  const handleSaveUtm = () => saveMarketingSettings({ utmBuilder }, 'UTM Builder');
  const handleSaveExperiment = () => saveMarketingSettings({ experimentSplit }, 'آزمایش A/B');

  const handleUtmChange = (field: keyof UTMState, value: string) => {
    setUtmBuilder((prev) => ({ ...prev, [field]: value }));
  };

  const utmUrl = useMemo(() => {
    if (!utmBuilder.baseUrl) return '';
    try {
      const url = new URL(utmBuilder.baseUrl.startsWith('http') ? utmBuilder.baseUrl : `https://${utmBuilder.baseUrl}`);
      const params = new URLSearchParams();
      Object.entries(utmBuilder).forEach(([key, value]) => {
        if (key === 'baseUrl') return;
        if (value) {
          params.set(`utm_${key}`, value);
        }
      });
      url.search = params.toString();
      return url.toString();
    } catch {
      return utmBuilder.baseUrl;
    }
  }, [utmBuilder]);

  const copyUtmLink = async () => {
    if (typeof navigator === 'undefined' || !navigator?.clipboard || !utmUrl) return;
    try {
      await navigator.clipboard.writeText(utmUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const controlPercent = experimentSplit;
  const variantPercent = 100 - experimentSplit;

  const perksAsString = useMemo(() => bannerContent.perks.join(', '), [bannerContent.perks]);

  type KpiCard = {
    id: string;
    label: string;
    value: number;
    delta: number;
    format: 'percent' | 'currency';
  };

  const derivedKpis = useMemo<KpiCard[]>(() => {
    const fallback: KpiCard[] = [
      { id: 'ctr', label: 'نرخ کلیک (CTR)', value: 0, delta: 0, format: 'percent' },
      { id: 'cvr', label: 'نرخ تبدیل (CVR)', value: 0, delta: 0, format: 'percent' },
      { id: 'cac', label: 'هزینه جذب کاربر', value: 0, delta: 0, format: 'currency' },
      { id: 'roi', label: 'ROI کمپین‌ها', value: 0, delta: 0, format: 'percent' }
    ];
    if (!metrics) return fallback;
    const calcDelta = (metric: MetricWithTrend) => {
      if (metric.previous === 0) {
        return metric.current > 0 ? 100 : 0;
      }
      return ((metric.current - metric.previous) / metric.previous) * 100;
    };
    return [
      { id: 'ctr', label: 'نرخ کلیک (CTR)', value: metrics.ctr.current, delta: calcDelta(metrics.ctr), format: 'percent' },
      { id: 'cvr', label: 'نرخ تبدیل (CVR)', value: metrics.cvr.current, delta: calcDelta(metrics.cvr), format: 'percent' },
      { id: 'cac', label: 'هزینه جذب کاربر', value: metrics.cac.current, delta: calcDelta(metrics.cac), format: 'currency' },
      { id: 'roi', label: 'ROI کمپین‌ها', value: metrics.roi.current, delta: calcDelta(metrics.roi), format: 'percent' }
    ];
  }, [metrics]);

  const formatKpiValue = (card: KpiCard) => {
    if (card.format === 'currency') {
      return `${Math.round(card.value).toLocaleString('fa-IR')} تومان`;
    }
    return `${card.value.toFixed(1)}%`;
  };

  if (loading && !lastSyncedAt) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center text-slate-600 shadow-sm">
          در حال بارگذاری داده‌های بازاریابی...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-6 sm:flex-row sm:items-center sm:justify-between shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Icon name="rocket" size={20} className="text-emerald-600" />
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">مرکز بازاریابی</p>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">کمپین‌ها و تبلیغات</h1>
          <p className="text-sm text-slate-600">مدیریت کمپین‌ها، ساخت لینک‌های قابل ردیابی و آزمایش A/B</p>
          {lastSyncedAt && (
            <p className="mt-2 text-xs text-slate-500 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              آخرین همگام‌سازی: {lastSyncedAt}
            </p>
          )}
        </div>
        <button
          onClick={() => fetchMarketingData()}
          disabled={loading}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-60 transition-all duration-200 hover:scale-105"
        >
          {loading ? (
            <>
              <Icon name="clock" size={16} />
              در حال بروزرسانی...
            </>
          ) : (
            <>
              <Icon name="refresh" size={16} />
              همگام‌سازی آمار
            </>
          )}
        </button>
      </header>

      {statusMessage && (
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            statusMessage.includes('ذخیره') ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          }`}
        >
          {statusMessage}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {derivedKpis.map((kpi) => (
          <article
            key={kpi.id}
            className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-xs text-slate-500">{kpi.label}</p>
            <p className="mt-3 text-2xl font-black text-slate-900">{formatKpiValue(kpi)}</p>
            <p className={`mt-2 text-xs font-bold ${kpi.delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {kpi.delta >= 0 ? '▲' : '▼'} {Math.abs(kpi.delta).toFixed(1)}% نسبت به دوره قبل
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">کمپین‌های فعال</h2>
              <p className="text-sm text-slate-500">کانال، بودجه و KPI هر کمپین را مدیریت کنید</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddCampaign}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                + کمپین جدید
              </button>
              <button
                onClick={handleSaveCampaigns}
                disabled={savingSection === 'کمپین‌ها'}
                className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-600 disabled:opacity-60"
              >
                {savingSection === 'کمپین‌ها' ? 'در حال ذخیره...' : 'ذخیره کمپین‌ها'}
              </button>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-slate-500">
                  <th className="p-3 text-right">نام کمپین</th>
                  <th className="p-3 text-right">کانال</th>
                  <th className="p-3 text-right">بودجه (میلیون تومان)</th>
                  <th className="p-3 text-right">CTR</th>
                  <th className="p-3 text-right">CVR</th>
                  <th className="p-3 text-right">بازه</th>
                  <th className="p-3 text-right">وضعیت</th>
                  <th className="p-3 text-right">اکشن</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="p-3 font-semibold text-slate-900">
                      <input
                        value={campaign.name}
                        onChange={(event) => handleCampaignChange(campaign.id, 'name', event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                      />
                    </td>
                    <td className="p-3">
                      <select
                        value={campaign.channel}
                        onChange={(event) => handleCampaignChange(campaign.id, 'channel', event.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                      >
                        {channelOptions.map((channel) => (
                          <option key={channel} value={channel}>
                            {channel}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={campaign.budget}
                        onChange={(event) => handleCampaignChange(campaign.id, 'budget', Number(event.target.value))}
                        className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-xs"
                        min={0}
                      />
                    </td>
                    <td className="p-3 text-right font-mono text-xs text-slate-600">{campaign.ctr.toFixed(1)}%</td>
                    <td className="p-3 text-right font-mono text-xs text-slate-600">{campaign.cvr.toFixed(1)}%</td>
                    <td className="p-3 text-xs text-slate-600">
                      <div className="space-y-1">
                        <input
                          value={campaign.startDate}
                          onChange={(event) => handleCampaignChange(campaign.id, 'startDate', event.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[11px]"
                        />
                        <input
                          value={campaign.endDate}
                          onChange={(event) => handleCampaignChange(campaign.id, 'endDate', event.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[11px]"
                        />
                      </div>
                    </td>
                    <td className="p-3">
                      <select
                        value={campaign.status}
                        onChange={(event) =>
                          handleCampaignChange(campaign.id, 'status', event.target.value as CampaignStatus)
                        }
                        className={`w-28 rounded-xl border px-3 py-2 text-xs font-bold ${statusStyles[campaign.status]}`}
                      >
                        <option value="active">فعال</option>
                        <option value="paused">متوقف</option>
                        <option value="draft">پیش‌نویس</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleRemoveCampaign(campaign.id)}
                        className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-1 text-xs text-rose-600 hover:bg-rose-100"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">آزمایش A/B بنر</h2>
          <p className="text-sm text-slate-500">تقسیم ترافیک بین نسخه کنترل و نسخه خلاق جدید</p>
          <div className="mt-5 space-y-6">
            <label className="block text-sm text-slate-600">
              درصد ترافیک نسخه کنترل
              <input
                type="range"
                min={10}
                max={90}
                value={experimentSplit}
                onChange={(event) => setExperimentSplit(Number(event.target.value))}
                className="mt-3 w-full accent-emerald-500"
              />
            </label>
            <div className="grid grid-cols-2 gap-4 text-center text-sm font-semibold">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Control</p>
                <p className="text-2xl font-black text-slate-900">{controlPercent}%</p>
                <p className="text-xs text-emerald-600">پیش‌بینی CTR: {(3.6 + controlPercent / 80).toFixed(1)}%</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                <p className="text-xs text-emerald-600">Variant</p>
                <p className="text-2xl font-black text-emerald-700">{variantPercent}%</p>
                <p className="text-xs text-emerald-600">پیش‌بینی CTR: {(4.1 + variantPercent / 70).toFixed(1)}%</p>
              </div>
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-xs text-slate-600">
              <p>تحلیل سیستم: ترکیب فعلی می‌تواند ۱۲٪ افزایش در نرخ تبدیل ایجاد کند.</p>
              <ul className="list-disc pr-4">
                <li>بهترین عملکرد روی کانال تلگرام</li>
                <li>CTA کوتاه &ldquo;دریافت Safe&rdquo; در تست‌های قبلی بهتر بوده است</li>
              </ul>
            </div>
            <button
              onClick={handleSaveExperiment}
              disabled={savingSection === 'آزمایش A/B'}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              {savingSection === 'آزمایش A/B' ? 'در حال ذخیره...' : 'ذخیره تقسیم ترافیک'}
            </button>
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="link" size={20} className="text-slate-600" />
            <div>
              <h2 className="text-lg font-black text-slate-900">سازنده لینک UTM</h2>
              <p className="text-xs text-slate-500">برای هر کمپین لینک قابل ردیابی بسازید</p>
            </div>
          </div>
          <div className="mt-4 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
            {(['baseUrl', 'source', 'medium', 'campaign', 'term', 'content'] as (keyof UTMState)[]).map((field) => (
              <label key={field} className="block">
                {field === 'baseUrl'
                  ? 'آدرس صفحه فرود'
                  : field === 'source'
                    ? 'utm_source'
                    : field === 'medium'
                      ? 'utm_medium'
                      : field === 'campaign'
                        ? 'utm_campaign'
                        : field === 'term'
                          ? 'utm_term'
                          : 'utm_content'}
                <input
                  value={utmBuilder[field] ?? ''}
                  onChange={(event) => handleUtmChange(field, event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                />
              </label>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">لینک نهایی</p>
            <p className="mt-2 break-all font-mono text-[11px] text-slate-500">{utmUrl || 'منتظر ورودی...'}</p>
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={copyUtmLink}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                disabled={!utmUrl}
              >
                {copied ? 'کپی شد!' : 'کپی لینک'}
              </button>
              <span className="text-[11px] text-slate-500">
                لینک را مستقیماً در تلگرام یا کمپین ایمیل استفاده کنید.
              </span>
            </div>
          </div>
          <button
            onClick={handleSaveUtm}
            disabled={savingSection === 'UTM Builder'}
            className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {savingSection === 'UTM Builder' ? 'در حال ذخیره...' : 'ذخیره لینک پیشفرض'}
          </button>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-purple-50/30 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="palette" size={20} className="text-purple-600" />
            <div>
              <h2 className="text-lg font-black text-slate-900">بنر خلاق (Legacy)</h2>
              <p className="text-xs text-slate-500">برای مدیریت بنرهای پیشرفته‌تر از <Link href="/admin/banners" className="text-emerald-600 font-semibold hover:underline">سیستم بنرهای پویا</Link> استفاده کنید</p>
            </div>
          </div>
          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <label className="block">
              عنوان بنر
              <input
                value={bannerContent.title}
                onChange={(event) => handleBannerChange('title', event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                زیرعنوان
                <input
                  value={bannerContent.subtitle}
                  onChange={(event) => handleBannerChange('subtitle', event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                />
              </label>
              <label className="block">
                نشان (Badge)
                <input
                  value={bannerContent.badge}
                  onChange={(event) => handleBannerChange('badge', event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                />
              </label>
            </div>
            <label className="block">
              توضیحات
              <textarea
                value={bannerContent.description}
                onChange={(event) => handleBannerChange('description', event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                rows={4}
              />
            </label>
            <label className="block">
              مزایا (با کاما جدا شود)
              <input
                value={perksAsString}
                onChange={(event) => handlePerkChange(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                برچسب قیمت
                <input
                  value={bannerContent.priceLabel}
                  onChange={(event) => handleBannerChange('priceLabel', event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                />
              </label>
              <label className="block">
                قیمت نمایشی
                <input
                  value={bannerContent.priceValue}
                  onChange={(event) => handleBannerChange('priceValue', event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                برچسب CTA
                <input
                  value={bannerContent.ctaLabel}
                  onChange={(event) => handleBannerChange('ctaLabel', event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                />
              </label>
              <label className="block">
                لینک CTA
                <input
                  value={bannerContent.ctaHref}
                  onChange={(event) => handleBannerChange('ctaHref', event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                />
              </label>
            </div>
          </div>
        </article>
      </section>
      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">پیش‌نمایش زنده & عملکرد پیش‌بینی‌شده</h2>
            <p className="text-sm text-slate-500">هر تغییری را در همان لحظه روی بنر ببینید</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center text-xs text-slate-500">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
              <p>CTR پیش‌بینی شده</p>
              <p className="mt-1 text-lg font-black text-slate-900">
                {(4.3 + bannerContent.perks.length / 10).toFixed(1)}%
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
              <p>Conversion Rate</p>
              <p className="mt-1 text-lg font-black text-emerald-600">
                {(2.4 + bannerContent.title.length / 120).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <CreativeBanner content={bannerContent} />
            {metrics && (
              <div className="grid gap-3 rounded-[28px] border border-slate-100 bg-white/60 p-4 text-xs text-slate-600 sm:grid-cols-3">
                <div>
                  <p className="text-[11px] text-slate-400">سفارشات پرداخت شده</p>
                  <p className="text-lg font-black text-slate-900">{metrics.paidOrders.toLocaleString('fa-IR')}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">درآمد کل</p>
                  <p className="text-lg font-black text-slate-900">
                    {Math.round(metrics.totalRevenue).toLocaleString('fa-IR')} تومان
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">میانگین ارزش سفارش</p>
                  <p className="text-lg font-black text-slate-900">
                    {Math.round(metrics.avgOrderValue).toLocaleString('fa-IR')} تومان
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-4 rounded-[28px] border border-slate-100 bg-slate-50/60 p-6 text-sm text-slate-600">
            <h3 className="text-base font-semibold text-slate-900">چک‌لیست قبل از انتشار</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  1
                </span>
                CTA با مقصد {bannerContent.ctaHref || '---'} بررسی شده است؟
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  2
                </span>
                کپی نهایی با تیم محتوا هماهنگ شده است.
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  3
                </span>
                بنر با ابعاد ۱۶:۹ و ۴:۵ آماده انتشار است.
              </li>
            </ul>
            <button
              onClick={handleSaveBanner}
              disabled={savingSection === 'بنر خلاق'}
              className="w-full rounded-2xl bg-emerald-500 py-3 text-sm font-bold text-white shadow hover:bg-emerald-600 disabled:opacity-60"
            >
              {savingSection === 'بنر خلاق' ? 'در حال ذخیره...' : 'ذخیره تغییرات بنر'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
