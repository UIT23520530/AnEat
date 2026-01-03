# 🚀 Quick Auto-Login Guide

Hướng dẫn đăng nhập nhanh cho Development & Testing

## 📋 3 Cách Auto-Login Nhanh Nhất

### ⚡ Cách 1: Console Script (NHANH NHẤT - 5 giây)

```bash
cd backend
npm run quick-login manager1@aneat.com
```

Script sẽ tự động copy console command vào clipboard. Sau đó:
1. Mở frontend: http://localhost:3000
2. Nhấn F12 (DevTools)
3. Paste vào Console
4. Enter → Tự động đăng nhập! 🎉

**Danh sách email có sẵn:**
- `admin@aneat.com` - Admin Hệ Thống
- `manager1@aneat.com` - Quản lý BR001 (Hoàn Kiếm)
- `manager2@aneat.com` - Quản lý BR002 (Tây Hồ)
- `staff.BR001.0@aneat.com` - Nhân viên BR001

### 🎯 Cách 2: Auto-Login Page (DỄ NHẤT)

Mở trực tiếp trong browser:
```
http://localhost:3000/auto-login.html
```

Click vào tài khoản muốn đăng nhập → Xong! ✨

### 🔧 Cách 3: Postman Testing

1. Tạo tokens cho tất cả users:
```bash
cd backend
npm run generate-tokens
```

2. Mở file `backend/tokens.json` và copy token cần dùng

3. Trong Postman:
   - Tab **Authorization**
   - Type: **Bearer Token**
   - Paste token vào

## 📊 Generate Tokens Mới

Khi token hết hạn hoặc cần refresh:

```bash
cd backend
npm run generate-tokens
```

File `tokens.json` sẽ được tạo với:
- Token cho tất cả 34 users
- Thông tin đầy đủ (name, email, role, branch)
- Valid trong 7 ngày

## 🔍 Debug Token

Kiểm tra token có valid không:

```bash
cd backend
npx ts-node scripts/debug-token.ts <your-token>
```

Tạo token mới:

```bash
npx ts-node scripts/debug-token.ts generate <userId> <email> <role> [branchId]
```

## 📝 Ví dụ Sử dụng

### Test với Manager BR001:
```bash
# Cách 1: Quick login
npm run quick-login manager1@aneat.com

# Hoặc copy token từ output của:
npm run generate-tokens
```

### Test với Staff:
```bash
npm run quick-login staff.BR001.0@aneat.com
```

### Test với Admin:
```bash
npm run quick-login admin@aneat.com
```

## 💡 Tips

- Token có hiệu lực **7 ngày**
- Nếu gặp lỗi 401, chạy lại `npm run generate-tokens`
- File `tokens.json` được tự động tạo mỗi lần generate
- Dành cho **Development only** - không dùng trong Production

## 🎨 Bonus: Browser Bookmarklet

Tạo bookmark trong browser với code này:

```javascript
javascript:(function(){var e=prompt("Email:","manager1@aneat.com");fetch("http://localhost:3001/api/v1/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,password:"password123"})}).then(r=>r.json()).then(d=>{localStorage.setItem("token",d.data.token);localStorage.setItem("user",JSON.stringify(d.data.user));alert("✅ Logged in!");location.reload()})})();
```

Click bookmark → Nhập email → Enter → Auto login! 🚀

---

**Happy Testing! 🎉**
