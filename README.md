# awesome-fb

CLI tool đăng bài lên Facebook Page, viết bằng Node.js.

## Cài đặt

```bash
npm install -g awesome-fb
```

Hoặc dùng trực tiếp từ source:

```bash
git clone <repo>
cd fbtool
npm install
npm link
```

## Cấu hình API Keys

Tạo file `.env` tại thư mục làm việc:

```env
# Bắt buộc nếu dùng tính năng tìm ảnh Unsplash
UNSPLASH_ACCESS_KEY=your_unsplash_key

# Bắt buộc nếu dùng tính năng tìm ảnh Pexels
PEXELS_API_KEY=your_pexels_key
```

Lấy key tại:
- Unsplash: https://unsplash.com/developers
- Pexels: https://www.pexels.com/api/

## Các lệnh

### Thêm Facebook Page

```bash
fb-post add-page
```

CLI sẽ hỏi lần lượt:
1. **Page ID** — phần số trong URL trang Facebook của bạn
2. **Access Token** — lấy từ [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/), chọn page rồi copy token
3. CLI tự xác minh với Facebook, nếu hợp lệ sẽ hiện tên page thật
4. Đặt **tên gợi nhớ** để dễ phân biệt khi có nhiều page

---

### Xem danh sách Pages

```bash
fb-post list-pages
```

Hiển thị bảng tất cả pages đã lưu kèm Page ID và ngày thêm.

---

### Tìm kiếm ảnh

```bash
fb-post search-image --query "coffee morning"
```

Tùy chọn:

| Flag | Mô tả | Mặc định |
|---|---|---|
| `-q, --query` | Từ khóa tìm kiếm (bắt buộc) | — |
| `-s, --source` | Nguồn ảnh: `unsplash`, `pexels` | `unsplash` |
| `-n, --count` | Số lượng ảnh hiển thị | `5` |

Ví dụ:

```bash
fb-post search-image --query "nature sunset" --source pexels --count 10
```

Ảnh được tải về lưu tại `~/.awesome-fb/images/`.

---

### Đăng bài

```bash
fb-post post
```

Luồng thực hiện (interactive):
1. Chọn page muốn đăng
2. Nhập nội dung bài viết (mở editor)
3. Chọn có đính kèm ảnh không:
   - Tìm ảnh qua Unsplash / Pexels
   - Hoặc nhập đường dẫn ảnh có sẵn trên máy
4. Preview bài trong trình duyệt (giả lập giao diện Facebook)
5. Xác nhận rồi đăng

#### Đăng nhanh không cần prompt

Truyền thẳng thông tin qua flag để bỏ qua toàn bộ bước hỏi:

```bash
# Chỉ text
fb-post post -p "Trang chính" -m "Nội dung bài viết" --no-preview -y

# Kèm ảnh local
fb-post post -p "Shop A" -m "Flash sale hôm nay!" -i "/path/to/anh.jpg" --no-preview -y
```

Tùy chọn:

| Flag | Mô tả |
|---|---|
| `-p, --page <name>` | Tên gợi nhớ của page (khớp với `list-pages`) |
| `-m, --message <text>` | Nội dung bài viết, bỏ qua editor |
| `-i, --image <path>` | Đường dẫn ảnh local |
| `--no-preview` | Bỏ qua bước mở preview trình duyệt |
| `-y, --yes` | Tự xác nhận, không hỏi lại |

Có thể kết hợp một phần — ví dụ chỉ dùng `-p` để bỏ qua chọn page nhưng vẫn mở editor nhập nội dung:

```bash
fb-post post -p "Trang chính"
```

---

## Dữ liệu lưu trữ

Tất cả dữ liệu lưu tại máy người dùng, không có server:

```
~/.awesome-fb/
├── config.json   # Danh sách pages và access token
└── images/       # Ảnh đã tải về
```

> **Lưu ý bảo mật:** Access token lưu plain text. Giữ bí mật thư mục `~/.awesome-fb/`.

## Xử lý lỗi thường gặp

| Lỗi | Cách xử lý |
|---|---|
| `Chưa có page nào` | Chạy `fb-post add-page` trước |
| `Token hết hạn` | Lấy token mới rồi chạy lại `fb-post add-page` |
| `Thiếu UNSPLASH_ACCESS_KEY` | Thêm key vào file `.env` |
| `Page ID không tồn tại` | Kiểm tra lại Page ID trên Facebook |
