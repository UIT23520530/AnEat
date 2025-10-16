# Cấu trúc thư mục src

Dưới đây là mô tả chi tiết về cấu trúc thư mục trong `src`:

```
src
├── app
│   ├── admin
│   │   ├── analytics
│   │   ├── dashboard
│   │   ├── invoices
│   │   ├── logs
│   │   ├── products
│   │   ├── promotions
│   │   ├── settings
│   │   ├── stores
│   │   ├── templates
│   │   └── users
│   ├── auth
│   │   ├── login
│   │   ├── register
│   │   └── unauthorized
│   ├── customer
│   │   ├── about-us
│   │   ├── checkout
│   │   ├── contact-us
│   │   ├── feedback
│   │   ├── history
│   │   ├── menu
│   │   ├── product
│   │   ├── profile-user
│   │   └── tracking-order
│   ├── manager
│   │   ├── analytics
│   │   ├── dashboard
│   │   ├── invoices
│   │   ├── products
│   │   ├── promotions
│   │   ├── settings
│   │   ├── staff
│   │   ├── tables
│   │   └── templates
│   ├── profile
│   └── staff
│       ├── customers
│       ├── kitchen
│       ├── orders
│       └── pos
├── components
│   ├── cart
│   ├── features
│   │   └── stores
│   ├── forms
│   ├── home
│   ├── layouts
│   └── ui
├── constants
├── contexts
├── hooks
├── lib
│   └── action
├── styles
└── types
```

## Mô tả chi tiết

*   **`src/app`**: Chứa các trang và tuyến đường của ứng dụng Next.js.
    *   **`admin`**: Trang quản trị.
    *   **`auth`**: Trang xác thực người dùng (đăng nhập, đăng ký).
    *   **`customer`**: Trang dành cho khách hàng.
    *   **`manager`**: Trang dành cho quản lý.
    *   **`profile`**: Trang hồ sơ người dùng.
    *   **`staff`**: Trang dành cho nhân viên.
*   **`src/components`**: Chứa các thành phần React có thể tái sử dụng.
    *   **`cart`**: Các thành phần liên quan đến giỏ hàng.
    *   **`features`**: Các thành phần thể hiện các tính năng cụ thể.
    *   **`forms`**: Các thành phần biểu mẫu.
    *   **`home`**: Các thành phần cho trang chủ.
    *   **`layouts`**: Các thành phần bố cục (ví dụ: thanh bên, điều hướng).
    *   **`ui`**: Các thành phần giao diện người dùng chung (nút, thẻ, v.v.).
*   **`src/constants`**: Chứa các hằng số được sử dụng trong toàn bộ ứng dụng.
*   **`src/contexts`**: Chứa các ngữ cảnh React để quản lý trạng thái toàn cục.
*   **`src/hooks`**: Chứa các hook React tùy chỉnh.
*   **`src/lib`**: Chứa các hàm và tiện ích trợ giúp.
    *   **`action`**: Chứa các hành động phía máy chủ.
*   **`src/styles`**: Chứa các tệp kiểu toàn cục.
*   **`src/types`**: Chứa các định nghĩa kiểu TypeScript.
