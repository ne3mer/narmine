# راهنمای رفع خطای 400 در Next.js

## مشکل
خطای `400 (Bad Request)` برای فایل‌های static chunks در Next.js

## راه‌حل‌ها

### 1. پاک کردن کش (انجام شده ✅)
```bash
cd frontend
rm -rf .next
rm -rf node_modules/.cache
```

### 2. Restart کردن Dev Server

**روش 1: از Terminal**
```bash
# متوقف کردن سرور فعلی (Ctrl+C)
# سپس:
cd frontend
npm run dev
```

**روش 2: از VS Code/Cursor**
- Terminal را باز کنید
- Process فعلی را با `Ctrl+C` متوقف کنید
- دوباره `npm run dev` را اجرا کنید

### 3. بررسی Port
مطمئن شوید که port 3000 در دسترس است:
```bash
lsof -ti:3000 | xargs kill -9  # اگر process دیگری استفاده می‌کند
```

### 4. پاک کردن Browser Cache
- Chrome/Edge: `Ctrl+Shift+Delete` → Clear cache
- یا Hard Refresh: `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac)

### 5. بررسی Node Version
```bash
node --version  # باید 18+ باشد
```

### 6. Reinstall Dependencies (در صورت نیاز)
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## نکات مهم

1. **همیشه بعد از تغییرات بزرگ، کش را پاک کنید**
2. **اگر مشکل ادامه داشت، browser را کاملاً ببندید و دوباره باز کنید**
3. **مطمئن شوید که هیچ process دیگری روی port 3000 در حال اجرا نیست**

