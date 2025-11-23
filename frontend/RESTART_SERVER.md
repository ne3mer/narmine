# دستورالعمل Restart سرور

## مشکل: خطای 400 برای Static Chunks

### راه‌حل سریع:

1. **متوقف کردن سرور فعلی:**
   ```bash
   # در ترمینالی که npm run dev اجرا شده:
   # Ctrl+C را بزنید
   ```

2. **پاک کردن کامل کش:**
   ```bash
   cd frontend
   rm -rf .next
   rm -rf node_modules/.cache
   ```

3. **Restart سرور:**
   ```bash
   npm run dev
   ```

4. **پاک کردن Browser Cache:**
   - Chrome/Edge: `Cmd+Shift+Delete` (Mac) یا `Ctrl+Shift+Delete` (Windows)
   - یا Hard Refresh: `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows)

### اگر مشکل ادامه داشت:

```bash
# Kill process روی port 3000
lsof -ti:3000 | xargs kill -9

# پاک کردن همه چیز
cd frontend
rm -rf .next node_modules/.cache

# Restart
npm run dev
```

### نکته مهم:
بعد از هر تغییر در `next.config.ts`، حتماً سرور را restart کنید!

