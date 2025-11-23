# 📧 راهنمای راه‌اندازی سیستم اعلان‌رسانی

این راهنما به شما کمک می‌کند سیستم اعلان‌رسانی Email و Telegram را راه‌اندازی کنید.

---

## 📋 پیش‌نیازها

1. **Node.js 18+** نصب شده باشد
2. **npm** یا **yarn** نصب شده باشد
3. دسترسی به یک **SMTP Server** برای Email
4. یک **Telegram Bot** برای ارسال پیام‌های تلگرام

---

## 🔧 مرحله ۱: نصب Dependencies

در پوشه `backend` دستور زیر را اجرا کنید:

```bash
cd backend
npm install
```

این دستور پکیج‌های زیر را نصب می‌کند:

- `nodemailer` - برای ارسال Email
- `node-telegram-bot-api` - برای ارسال پیام‌های Telegram

---

## 📧 مرحله ۲: راه‌اندازی Email (SMTP)

### گزینه ۱: استفاده از Gmail (برای تست)

1. **فعال‌سازی App Password در Gmail:**

   - به [Google Account Settings](https://myaccount.google.com/) بروید
   - Security → 2-Step Verification را فعال کنید
   - سپس App Passwords را فعال کنید
   - یک App Password برای "Mail" ایجاد کنید

2. **تنظیمات در `.env`:**

   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password-here
   ```

### گزینه ۲: استفاده از SendGrid (توصیه می‌شود برای Production)

1. **ثبت‌نام در SendGrid:**

   - به [SendGrid](https://sendgrid.com/) بروید و حساب کاربری بسازید
   - API Key ایجاد کنید

2. **تنظیمات در `.env`:**

   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key-here
   ```

### گزینه ۳: استفاده از SMTP Server شخصی

```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-password
```

### گزینه ۴: استفاده از Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@yourdomain.mailgun.org
SMTP_PASS=your-mailgun-password
```

---

## 🤖 مرحله ۳: راه‌اندازی Telegram Bot

### مرحله ۱: ساخت Bot

1. **شروع گفتگو با BotFather:**

   - در Telegram به [@BotFather](https://t.me/BotFather) پیام دهید
   - دستور `/newbot` را ارسال کنید
   - نام و username برای bot خود انتخاب کنید
   - BotFather یک **Token** به شما می‌دهد (مثل: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

2. **دریافت Chat ID:**

   **روش ۱: استفاده از Bot خودتان**

   - به bot خودتان پیام دهید
   - به [@userinfobot](https://t.me/userinfobot) پیام دهید تا Chat ID خود را ببینید
   - یا از [@getidsbot](https://t.me/getidsbot) استفاده کنید

   **روش ۲: استفاده از API**

   ```bash
   curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```

   سپس به bot خود پیام دهید و دوباره دستور را اجرا کنید. Chat ID در پاسخ JSON خواهد بود.

3. **تنظیمات در `.env`:**

   ```env
   TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   TELEGRAM_CHAT_ID=123456789
   ```

   **نکته:** `TELEGRAM_CHAT_ID` برای ارسال پیام‌های عمومی استفاده می‌شود. برای ارسال به کاربران خاص، Chat ID آنها در پروفایل کاربر ذخیره می‌شود.

---

## ⚙️ مرحله ۴: تنظیم Environment Variables

فایل `.env` در پوشه `backend` را باز کنید و مقادیر زیر را اضافه کنید:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Admin notification emails (optional fallback list)
ADMIN_NOTIFICATION_EMAILS=admin1@example.com,admin2@example.com

# Telegram Configuration
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id

# Client URL (برای لینک‌های موجود در ایمیل‌ها)
CLIENT_URL=http://localhost:3000
```

---

## ✅ مرحله ۵: تست سیستم

### تست Email

1. **راه‌اندازی سرور:**

   ```bash
   cd backend
   npm run dev
   ```

2. **ایجاد یک سفارش تست:**
   - به سایت بروید و یک سفارش ایجاد کنید
   - باید یک ایمیل تأیید سفارش دریافت کنید

### تست Telegram

1. **ارسال پیام تست:**

   - به bot خود در Telegram پیام دهید
   - اگر bot درست تنظیم شده باشد، باید پاسخ دهد

2. **تست با سفارش:**
   - در پروفایل کاربر، آیدی Telegram خود را وارد کنید
   - یک سفارش ایجاد کنید
   - باید پیام در Telegram دریافت کنید

---

## 🔍 عیب‌یابی

### مشکل: ایمیل ارسال نمی‌شود

1. **بررسی لاگ‌ها:**

   - در console سرور، پیام‌های خطا را بررسی کنید
   - اگر `Email service not configured` می‌بینید، SMTP credentials را بررسی کنید

2. **تست SMTP:**

   ```bash
   # می‌توانید با telnet تست کنید
   telnet smtp.gmail.com 587
   ```

3. **بررسی Firewall:**
   - مطمئن شوید که پورت 587 یا 465 باز است

### مشکل: Telegram Bot کار نمی‌کند

1. **بررسی Token:**

   - مطمئن شوید Token درست است
   - Token باید به فرمت `123456789:ABC...` باشد

2. **بررسی Chat ID:**

   - مطمئن شوید Chat ID عددی است (نه username)
   - برای کاربران، Chat ID باید در پروفایل ذخیره شده باشد

3. **بررسی Bot:**
   - مطمئن شوید bot شما فعال است
   - به bot خود پیام دهید و ببینید آیا پاسخ می‌دهد

---

## 📝 نکات مهم

### امنیت

1. **هرگز Token یا Password را در Git commit نکنید**
2. **از Environment Variables استفاده کنید**
3. **در Production از SMTP Server امن استفاده کنید**

### محدودیت‌ها

- **Gmail:** روزانه حداکثر ۵۰۰ ایمیل
- **SendGrid:** در نسخه رایگان ۱۰۰ ایمیل در روز
- **Telegram:** محدودیتی ندارد اما rate limiting دارد

### بهترین روش‌ها

1. **برای Production از SendGrid یا Mailgun استفاده کنید**
2. **Email templates را customize کنید**
3. **Error handling را بررسی کنید**
4. **Logging را فعال کنید**

---

## 🎯 استفاده در کد

سیستم به صورت خودکار در موارد زیر فعال می‌شود:

1. **ایجاد سفارش:** ایمیل/تلگرام تأیید سفارش ارسال می‌شود
2. **تحویل سفارش:** وقتی ادمین اطلاعات اکانت را وارد می‌کند
3. **هشدار قیمت:** وقتی قیمت یک بازی کاهش می‌یابد

### استفاده دستی

```typescript
import { sendNotification } from "./services/notificationSender.service";

// ارسال اعلان سفارش
await sendOrderConfirmation(
  userId,
  orderId,
  orderNumber,
  email,
  telegramChatId,
  totalAmount,
  items
);

// ارسال اطلاعات تحویل
await sendOrderDelivery(
  userId,
  orderId,
  orderNumber,
  email,
  telegramChatId,
  credentials,
  message
);

// ارسال هشدار قیمت
await sendPriceAlert(
  userId,
  gameTitle,
  currentPrice,
  targetPrice,
  gameUrl,
  "email", // یا 'telegram'
  destination
);
```

---

## 📚 منابع بیشتر

- [Nodemailer Documentation](https://nodemailer.com/about/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)

---

## ✅ چک‌لیست راه‌اندازی

- [ ] Dependencies نصب شده
- [ ] SMTP credentials تنظیم شده
- [ ] Telegram Bot Token دریافت شده
- [ ] Environment Variables تنظیم شده
- [ ] تست Email موفق
- [ ] تست Telegram موفق
- [ ] لاگ‌ها بررسی شده

---

**نکته:** اگر مشکلی داشتید، لاگ‌های console را بررسی کنید. همه خطاها در console نمایش داده می‌شوند.
