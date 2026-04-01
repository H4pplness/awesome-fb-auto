# 📋 Đặc Tả Kỹ Thuật: awesome-fb

> **Công cụ CLI đăng bài lên Facebook Page — viết bằng Node.js, phân phối qua npm**

---

## 1. Tổng Quan Dự Án

| Thuộc tính | Chi tiết |
|---|---|
| **Tên package** | `awesome-fb` |
| **Ngôn ngữ** | Node.js (ES Modules hoặc CommonJS) |
| **Phân phối** | npm public registry |
| **Lưu trữ** | Local (trên máy người dùng) |
| **Mục tiêu** | CLI đơn giản để quản lý và đăng bài lên Facebook Page |

---

## 2. Kiến Trúc Tổng Thể

```
awesome-fb/
├── bin/
│   └── fb-post.js           # Entry point CLI (shebang script)
├── src/
│   ├── commands/
│   │   ├── post.js          # Lệnh: tạo bài viết
│   │   ├── search-image.js  # Lệnh: tìm kiếm ảnh
│   │   ├── add-page.js      # Lệnh: thêm page
│   │   └── list-pages.js    # Lệnh: liệt kê page
│   ├── adapters/
│   │   ├── image-adapter.js     # Interface chuẩn cho image source
│   │   ├── unsplash-adapter.js  # Adapter cho Unsplash
│   │   └── pexels-adapter.js    # (Ví dụ mở rộng) Adapter cho Pexels
│   ├── services/
│   │   ├── facebook.js      # Giao tiếp với Facebook Graph API
│   │   └── storage.js       # Đọc/ghi dữ liệu local
│   └── utils/
│       ├── config.js        # Quản lý đường dẫn config local
│       └── logger.js        # Log / hiển thị kết quả ra terminal
├── package.json
└── README.md
```

---

## 3. Lưu Trữ Local

Tất cả dữ liệu được lưu trên máy người dùng, **không có server/database từ xa**.

### 3.1 Đường dẫn lưu trữ

```
~/.awesome-fb/
├── config.json      # Danh sách pages đã thêm
└── images/          # Ảnh tải về từ các nguồn tìm kiếm
```

### 3.2 Cấu trúc `config.json`

```json
{
  "pages": [
    {
      "id": "123456789",
      "name": "Trang Bán Hàng A",
      "accessToken": "EAAxxxxxx...",
      "addedAt": "2025-04-01T08:00:00Z"
    }
  ]
}
```

> **Bảo mật:** Access token được lưu plain text ở local. Người dùng cần tự bảo vệ thư mục `~/.awesome-fb/`. Phiên bản sau có thể tích hợp keychain/OS secret store.

---

## 4. Chức Năng Chi Tiết

### 4.1 Tạo Bài Viết (`post`)

**Lệnh:**
```bash
fb-post post
```

**Luồng thực thi:**

1. Kiểm tra danh sách pages trong `config.json`. Nếu chưa có page nào → báo lỗi, hướng dẫn dùng `add-page`.
2. Hiển thị menu chọn page (dùng `inquirer` hoặc tương đương).
3. Nhập **nội dung bài viết** (content/caption).
4. Hỏi người dùng có muốn đính kèm ảnh không:
   - **Có** → cho phép chọn: (a) tìm ảnh qua lệnh search, hoặc (b) nhập đường dẫn ảnh local.
   - **Không** → bỏ qua bước ảnh.
5. Xác nhận thông tin trước khi đăng.
6. Gọi **Facebook Graph API** để đăng bài.
7. Hiển thị kết quả: Post ID, link bài viết.

**Facebook API sử dụng:**

| Trường hợp | Endpoint |
|---|---|
| Chỉ text | `POST /{page-id}/feed` |
| Text + ảnh | `POST /{page-id}/photos` |

**Payload mẫu (text + ảnh):**
```json
{
  "message": "Nội dung bài viết",
  "source": "<binary image data>",
  "access_token": "<page_access_token>"
}
```

---

### 4.2 Tìm Kiếm Ảnh (`search-image`)

**Lệnh:**
```bash
fb-post search-image --query "coffee morning" --source unsplash
```

**Tham số:**

| Flag | Bắt buộc | Mô tả | Mặc định |
|---|---|---|---|
| `--query` / `-q` | ✅ | Từ khóa tìm kiếm | — |
| `--source` / `-s` | ❌ | Nguồn ảnh (`unsplash`, `pexels`, ...) | `unsplash` |
| `--count` / `-n` | ❌ | Số lượng ảnh hiển thị | `5` |

**Luồng thực thi:**

1. Nhận `--query` và `--source` từ người dùng.
2. Gọi đúng **Adapter** tương ứng với `--source`.
3. Hiển thị danh sách ảnh (thumbnail URL + tên tác giả).
4. Người dùng chọn ảnh muốn tải về.
5. Tải ảnh về thư mục `~/.awesome-fb/images/`.
6. Hiển thị đường dẫn file đã lưu.

#### Adapter Pattern

Tất cả adapter phải implement interface sau:

```javascript
// src/adapters/image-adapter.js (Interface / Base class)
class ImageAdapter {
  /**
   * @param {string} query - Từ khóa tìm kiếm
   * @param {number} count - Số lượng kết quả
   * @returns {Promise<ImageResult[]>}
   */
  async search(query, count) {
    throw new Error('search() phải được implement bởi adapter con');
  }

  /**
   * @param {string} url - URL ảnh cần tải
   * @param {string} destPath - Đường dẫn lưu file
   * @returns {Promise<string>} - Đường dẫn file đã lưu
   */
  async download(url, destPath) {
    throw new Error('download() phải được implement bởi adapter con');
  }
}

/**
 * @typedef {Object} ImageResult
 * @property {string} id
 * @property {string} description
 * @property {string} thumbUrl
 * @property {string} downloadUrl
 * @property {string} author
 * @property {string} sourceName
 */
```

**Unsplash Adapter (`unsplash-adapter.js`):**

- API: `https://api.unsplash.com/search/photos`
- Auth: `Authorization: Client-ID <UNSPLASH_ACCESS_KEY>`
- Người dùng cần cấu hình `UNSPLASH_ACCESS_KEY` (xem Phần 6).

**Thêm nguồn ảnh mới:**  
Chỉ cần tạo file `<ten>-adapter.js` trong `src/adapters/`, implement `search()` và `download()`, rồi đăng ký trong `adapter-registry.js`.

---

### 4.3 Thêm Page (`add-page`)

**Lệnh:**
```bash
fb-post add-page
```

**Luồng thực thi:**

1. Prompt nhập **Page ID** (lấy từ Facebook).
2. Prompt nhập **Access Token** của page đó.
3. Gọi Facebook Graph API để **xác minh** page tồn tại và token hợp lệ:
   ```
   GET /{page-id}?fields=id,name&access_token={token}
   ```
4. Nếu hợp lệ: hiển thị tên page thực tế từ Facebook.
5. Prompt yêu cầu người dùng **đặt tên gợi nhớ** cho page trong CLI (ví dụ: "Trang chính", "Shop A").
6. Lưu thông tin vào `~/.awesome-fb/config.json`.
7. Hiển thị thông báo thành công.

**Xử lý lỗi:**

- Token hết hạn / sai → thông báo rõ ràng, không lưu.
- Page ID không tồn tại → báo lỗi.
- Page đã tồn tại trong config → hỏi có muốn cập nhật token không.

---

### 4.4 Liệt Kê Pages (`list-pages`)

**Lệnh:**
```bash
fb-post list-pages
```

**Output mẫu:**
```
┌─────────────────────────────────────────────────────┐
│  Danh sách Facebook Pages đã lưu                    │
├───┬──────────────────┬─────────────────┬────────────┤
│ # │ Tên gợi nhớ      │ Page ID         │ Ngày thêm  │
├───┼──────────────────┼─────────────────┼────────────┤
│ 1 │ Trang chính      │ 123456789       │ 01/04/2025 │
│ 2 │ Shop A           │ 987654321       │ 15/03/2025 │
└───┴──────────────────┴─────────────────┴────────────┘
Tổng: 2 page(s)
```

---

## 5. Sơ Đồ Luồng Dữ Liệu

```
Người dùng (Terminal)
        │
        ▼
   bin/fb-post.js  ──── parse args (commander/yargs)
        │
        ▼
  commands/*.js   ──── logic điều phối
        │
   ┌────┴──────────────────────────┐
   ▼                               ▼
services/storage.js       services/facebook.js
(đọc/ghi local)            (gọi Graph API)
~/.awesome-fb/
        │
        ▼
   adapters/*.js
(tìm & tải ảnh từ API bên ngoài)
```

---

## 6. Cấu Hình API Keys

Người dùng cấu hình API key qua **biến môi trường** hoặc file `.env` tại thư mục hiện tại:

```bash
# Unsplash
UNSPLASH_ACCESS_KEY=your_unsplash_key

# (Mở rộng) Pexels
PEXELS_API_KEY=your_pexels_key
```

CLI sẽ đọc từ `process.env` và hiển thị cảnh báo nếu thiếu key khi dùng tính năng liên quan.

---

## 7. Dependencies Dự Kiến

| Package | Mục đích |
|---|---|
| `commander` hoặc `yargs` | Parse CLI arguments |
| `inquirer` | Interactive prompts (chọn page, ảnh...) |
| `axios` hoặc `node-fetch` | Gọi HTTP API (Facebook, Unsplash...) |
| `cli-table3` | Hiển thị bảng đẹp trong terminal |
| `chalk` | Tô màu output terminal |
| `ora` | Spinner loading khi gọi API |
| `fs-extra` | Thao tác file/thư mục nâng cao |
| `dotenv` | Đọc biến môi trường từ `.env` |

---

## 8. Phân Phối lên npm

### 8.1 Cấu hình `package.json`

```json
{
  "name": "awesome-fb",
  "version": "1.0.0",
  "description": "CLI tool để đăng bài lên Facebook Page",
  "bin": {
    "fb-post": "./bin/fb-post.js"
  },
  "keywords": ["facebook", "cli", "post", "social-media"],
  "engines": {
    "node": ">=16.0.0"
  },
  "files": [
    "bin/",
    "src/",
    "README.md"
  ]
}
```

### 8.2 Quy trình publish

```bash
# 1. Đăng nhập npm
npm login

# 2. Kiểm tra package trước khi publish
npm pack --dry-run

# 3. Publish
npm publish --access public
```

### 8.3 Cách người dùng cài đặt và sử dụng

```bash
# Cài đặt global
npm install -g awesome-fb

# Sử dụng ngay
fb-post list-pages
fb-post add-page
fb-post search-image --query "nature sunset"
fb-post post
```

---

## 9. Xử Lý Lỗi & UX

| Tình huống | Hành vi |
|---|---|
| Chưa có page nào | Thông báo rõ ràng + hướng dẫn chạy `add-page` |
| Token hết hạn | Hiển thị lỗi + hướng dẫn lấy token mới |
| Thiếu API key ảnh | Cảnh báo, bỏ qua tính năng tìm ảnh |
| Không có Internet | Bắt lỗi mạng, thông báo thân thiện |
| File `config.json` bị hỏng | Tự tạo lại file mới, cảnh báo người dùng |

---

## 10. Lộ Trình Mở Rộng (Future)

- Thêm adapter ảnh: **Pexels**, **Pixabay**, **Getty Images**
- Hỗ trợ đăng **nhiều ảnh** trong một bài (carousel)
- Hỗ trợ **lên lịch** đăng bài (scheduled post)
- Lưu **bản nháp** bài viết chưa đăng
- Hỗ trợ đăng lên **Instagram** (dùng cùng Graph API)
- Mã hóa access token lưu trữ local (OS keychain)

---

*Đặc tả phiên bản 1.0 — tháng 4/2025*
