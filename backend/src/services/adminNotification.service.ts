import { env } from '../config/env';
import { sendEmail } from './email.service';
import { UserModel } from '../models/user.model';
import type { PaymentStatus, FulfillmentStatus } from '../models/order.model';

type TriggerSource = {
  name?: string | null;
  email?: string | null;
};

type OrderCreatedEvent = {
  type: 'order_created';
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  note?: string;
  paymentMethod?: string;
  customer: {
    name?: string | null;
    email: string;
    phone?: string;
  };
  items: Array<{ title: string; quantity: number; price?: number }>;
  createdAt?: Date;
};

type GameRequestCreatedEvent = {
  type: 'game_request_created';
  requestId: string;
  gameName: string;
  platform: string;
  region: string;
  description?: string;
  requestedBy?: TriggerSource;
  createdAt?: Date;
};

type ReviewSubmittedEvent = {
  type: 'review_submitted';
  reviewId: string;
  gameTitle: string;
  rating: number;
  comment: string;
  submittedBy?: TriggerSource;
  createdAt?: Date;
};

type CustomAdminEvent = {
  type: 'custom';
  subject: string;
  message: string;
  meta?: Record<string, string | number | undefined>;
};

export type AdminNotificationEvent =
  | OrderCreatedEvent
  | GameRequestCreatedEvent
  | ReviewSubmittedEvent
  | CustomAdminEvent;

const emailPlaceholders = () =>
  env.ADMIN_NOTIFICATION_EMAILS
    ? env.ADMIN_NOTIFICATION_EMAILS.split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

const escapeHtml = (value?: string | null) => {
  if (!value) return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const formatMultiline = (value?: string | null) =>
  escapeHtml(value).replace(/\n/g, '<br />');

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fa-IR').format(value);

const formatDate = (value?: Date) => {
  try {
    return (value ?? new Date()).toLocaleString('fa-IR');
  } catch {
    return new Date().toLocaleString('fa-IR');
  }
};

const section = (title: string, content: string) => `
  <div style="margin-top:16px;">
    <h3 style="font-size:16px;margin:0 0 8px 0;color:#111827;">${title}</h3>
    <div style="font-size:14px;color:#374151;line-height:1.7;">${content}</div>
  </div>
`;

const wrapEmail = (heading: string, body: string) => `
  <!DOCTYPE html>
  <html dir="rtl" lang="fa">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${heading}</title>
    </head>
    <body style="font-family:Tahoma,Arial,sans-serif;background:#f8fafc;margin:0;padding:24px;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:20px;padding:32px;box-shadow:0 15px 35px rgba(15,23,42,0.08);">
        <h2 style="margin:0;font-size:22px;color:#111827;">${heading}</h2>
        ${body}
        <p style="margin-top:32px;font-size:12px;color:#94a3b8;">این پیام به صورت خودکار برای مدیران ارسال شده است.</p>
      </div>
    </body>
  </html>
`;

const renderKeyValueList = (rows: Array<[string, string]>) => `
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <tbody>
      ${rows
        .map(
          ([label, value]) => `
            <tr>
              <td style="padding:6px 0;width:150px;color:#6b7280;">${label}</td>
              <td style="padding:6px 0;color:#111827;font-weight:600;">${value}</td>
            </tr>
          `
        )
        .join('')}
    </tbody>
  </table>
`;

const buildEmailContent = (event: AdminNotificationEvent) => {
  switch (event.type) {
    case 'order_created': {
      const subject = `🛒 سفارش جدید: ${event.orderNumber}`;
      const itemsHtml = event.items
        .map(
          (item) => `
            <li>
              <strong>${escapeHtml(item.title)}</strong>
              <span style="color:#6b7280;"> — ${item.quantity} عدد ${
                typeof item.price === 'number'
                  ? `× ${formatCurrency(item.price)} تومان`
                  : ''
              }</span>
            </li>
          `
        )
        .join('');

      const summaryRows: Array<[string, string]> = [
        ['شماره سفارش', escapeHtml(event.orderNumber)],
        [
          'مبلغ کل',
          `${formatCurrency(event.totalAmount)} <span style="color:#6b7280;">تومان</span>`
        ],
        ['وضعیت پرداخت', escapeHtml(event.paymentStatus)],
        ['روش پرداخت', event.paymentMethod === 'wallet' ? 'کیف پول' : 'درگاه اینترنتی'],
        ['وضعیت تحویل', escapeHtml(event.fulfillmentStatus)],
        [
          'نام مشتری',
          escapeHtml(event.customer.name ?? 'بدون نام')
        ],
        ['ایمیل مشتری', escapeHtml(event.customer.email)],
        ['شماره تماس', escapeHtml(event.customer.phone ?? '---')],
        ['تاریخ ایجاد', formatDate(event.createdAt)]
      ];

      const summary = renderKeyValueList(summaryRows);

      const noteSection = event.note
        ? section(
            'توضیحات مشتری',
            `<div style="padding:12px;border-radius:16px;background:#fff7ed;border:1px solid #ffedd5;color:#9a3412;">${formatMultiline(
              event.note
            )}</div>`
          )
        : '';

      const body = `
        ${section(
          'سفارش جدید در سیستم ثبت شد',
          '<p style="margin:0;color:#374151;">لطفاً سفارش جدید را در پنل مدیریت بررسی کنید.</p>'
        )}
        ${section('جزئیات سفارش', summary)}
        ${noteSection}
        ${section(
          'اقلام سفارش',
          `<ul style="padding-right:18px;margin:0;color:#111827;">${itemsHtml}</ul>`
        )}
      `;

      return { subject, html: wrapEmail('سفارش جدید دریافت شد', body) };
    }
    case 'game_request_created': {
      const subject = `📝 فرم جدید: ${event.gameName}`;
      const requesterInfo = event.requestedBy
        ? renderKeyValueList([
            ['نام کاربر', escapeHtml(event.requestedBy.name ?? '---')],
            ['ایمیل کاربر', escapeHtml(event.requestedBy.email ?? '---')]
          ])
        : '';

      const body = `
        ${section(
          'درخواست بازی جدید ارسال شد',
          '<p style="margin:0;color:#374151;">یکی از کاربران فرم درخواست بازی را پر کرده است.</p>'
        )}
        ${section(
          'مشخصات درخواست',
          renderKeyValueList([
            ['نام بازی', escapeHtml(event.gameName)],
            ['پلتفرم', escapeHtml(event.platform)],
            ['ریجن', escapeHtml(event.region)],
            ['شناسه درخواست', escapeHtml(event.requestId)],
            ['تاریخ', formatDate(event.createdAt)]
          ])
        )}
        ${
          event.description
            ? section(
                'توضیحات',
                `<div style="padding:12px;border-radius:16px;background:#f8fafc;border:1px solid #e2e8f0;color:#111827;">${formatMultiline(
                  event.description
                )}</div>`
              )
            : ''
        }
        ${requesterInfo ? section('مشخصات ارسال‌کننده', requesterInfo) : ''}
      `;

      return { subject, html: wrapEmail('درخواست جدید بازی', body) };
    }
    case 'review_submitted': {
      const subject = `💬 پیام/نظر جدید برای ${event.gameTitle}`;
      const reviewerInfo = event.submittedBy
        ? renderKeyValueList([
            ['نام کاربر', escapeHtml(event.submittedBy.name ?? '---')],
            ['ایمیل کاربر', escapeHtml(event.submittedBy.email ?? '---')]
          ])
        : '';

      const body = `
        ${section(
          'یک پیام/نظر جدید ثبت شد',
          '<p style="margin:0;color:#374151;">کاربر جدیدی برای یکی از بازی‌ها نظر ارسال کرده است.</p>'
        )}
        ${section(
          'جزئیات پیام',
          renderKeyValueList([
            ['بازی', escapeHtml(event.gameTitle)],
            ['امتیاز', `${event.rating} / 5`],
            ['شناسه نظر', escapeHtml(event.reviewId)],
            ['تاریخ', formatDate(event.createdAt)]
          ])
        )}
        ${section(
          'متن پیام',
          `<div style="padding:12px;border-radius:16px;background:#ecfeff;border:1px solid #a5f3fc;color:#0f172a;">${formatMultiline(
            event.comment
          )}</div>`
        )}
        ${reviewerInfo ? section('ارسال‌کننده', reviewerInfo) : ''}
      `;

      return { subject, html: wrapEmail('پیام جدید کاربران', body) };
    }
    default: {
      const metaSection =
        event.type === 'custom' && event.meta
          ? section(
              'اطلاعات تکمیلی',
              renderKeyValueList(
                Object.entries(event.meta).map(([key, value]) => [
                  key,
                  escapeHtml(String(value ?? '---'))
                ])
              )
            )
          : '';

      const subject =
        event.type === 'custom'
          ? event.subject
          : 'اعلان جدید برای مدیران';

      const message =
        event.type === 'custom'
          ? event.message
          : 'رویداد جدیدی در سیستم ثبت شد.';

      const body = `
        ${section(
          'رویداد جدید',
          `<p style="margin:0;color:#374151;">${formatMultiline(message)}</p>`
        )}
        ${metaSection}
      `;

      return { subject, html: wrapEmail('اعلان جدید مدیران', body) };
    }
  }
};

const getAdminEmails = async () => {
  const envEmails = emailPlaceholders();
  const admins = await UserModel.find({ role: 'admin' })
    .select('email')
    .lean();

  const emailMap = new Map<string, string>();
  envEmails.forEach((email) => {
    emailMap.set(email.toLowerCase(), email);
  });

  admins.forEach((admin) => {
    if (admin.email) {
      emailMap.set(admin.email.toLowerCase(), admin.email);
    }
  });

  return Array.from(emailMap.values());
};

export const notifyAdminsOfEvent = async (event: AdminNotificationEvent) => {
  try {
    const recipients = await getAdminEmails();

    if (!recipients.length) {
      console.warn('Admin notification skipped: no admin emails configured');
      return;
    }

    const { subject, html } = buildEmailContent(event);

    await sendEmail({
      to: recipients.join(','),
      subject,
      html
    });
  } catch (error) {
    console.error('Failed to send admin notification:', error);
  }
};
