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
UNSPLASH_ACCESS_KEY=your_unsplash_key
PEXELS_API_KEY=your_pexels_key
```

Lấy key tại: [Unsplash Developers](https://unsplash.com/developers) · [Pexels API](https://www.pexels.com/api/)

---

## Tổng quan lệnh

```
fb-post add-page                          Thêm Facebook Page mới
fb-post list-pages                        Xem danh sách pages đã lưu
fb-post search-image -q <từ khóa>        Tìm và tải ảnh
fb-post post                              Đăng bài (interactive)
fb-post post -p <page> -m <nội dung> -y  Đăng bài nhanh 1 dòng
fb-post draft                             Menu quản lý bài nháp
fb-post draft save                        Lưu bài nháp
fb-post draft list                        Xem danh sách nháp
fb-post draft preview                     Preview bài nháp
fb-post draft delete                      Xóa bài nháp
```

---

## Quản lý Pages

### Thêm page

```bash
fb-post add-page
```

1. Nhập **Page ID** — phần số trong URL trang Facebook của bạn
2. Nhập **Access Token** — lấy từ [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/), chọn page rồi copy token
3. CLI tự xác minh với Facebook, hiển thị tên page thật
4. Đặt **tên gợi nhớ** để dễ phân biệt khi có nhiều page

Nếu page đã tồn tại, CLI hỏi có muốn cập nhật token mới không.

### Xem danh sách pages

```bash
fb-post list-pages
```

Hiển thị bảng tất cả pages đã lưu kèm Page ID và ngày thêm.

---

## Tìm kiếm ảnh

```bash
fb-post search-image --query "coffee morning"
fb-post search-image --query "nature sunset" --source pexels --count 10
```

| Flag | Mô tả | Mặc định |
|---|---|---|
| `-q, --query` | Từ khóa tìm kiếm **(bắt buộc)** | — |
| `-s, --source` | Nguồn ảnh: `unsplash`, `pexels` | `unsplash` |
| `-n, --count` | Số lượng ảnh hiển thị | `5` |

Ảnh tải về lưu tại `~/.awesome-fb/images/`.

---

## Đăng bài

### Interactive (đầy đủ prompt)

```bash
fb-post post
```

Luồng thực hiện:
1. Nếu có bài nháp → hỏi có muốn tải từ nháp không
2. Chọn page muốn đăng
3. Nhập nội dung bài viết (mở editor)
4. Chọn có đính kèm ảnh không: tìm ảnh qua Unsplash/Pexels hoặc nhập đường dẫn local
5. Preview bài trong trình duyệt (giả lập giao diện Facebook)
6. Xác nhận rồi đăng

### Đăng nhanh 1 dòng

Truyền flag để bỏ qua từng bước hỏi:

```bash
# Chỉ text
fb-post post -p "Trang chính" -m "Nội dung bài viết" --no-preview -y

# Kèm ảnh
fb-post post -p "Shop A" -m "Flash sale hôm nay!" -i "/path/to/anh.jpg" --no-preview -y

# Bỏ qua chọn page, vẫn mở editor
fb-post post -p "Trang chính"
```

| Flag | Mô tả |
|---|---|
| `-p, --page <name>` | Tên gợi nhớ page — bỏ qua prompt chọn page |
| `-m, --message <text>` | Nội dung bài — bỏ qua editor |
| `-i, --image <path>` | Đường dẫn ảnh local |
| `--no-preview` | Bỏ qua bước mở preview trình duyệt |
| `-y, --yes` | Tự xác nhận, không hỏi lại |

---

## Bài viết nháp

Lưu bài viết chưa đăng để dùng lại sau, có thể preview trước khi đăng.

```bash
fb-post draft           # Menu tổng hợp
fb-post draft save      # Lưu bài nháp mới
fb-post draft list      # Xem danh sách nháp
fb-post draft preview   # Preview bài nháp trong trình duyệt
fb-post draft delete    # Xóa bài nháp
```

Khi chạy `fb-post post`, nếu có bài nháp CLI sẽ hỏi:
```
? Bạn có 2 bài nháp. Tải nội dung từ bài nháp? (y/N)
```
Chọn nháp xong tự điền nội dung và ảnh — không cần nhập lại từ đầu.

---

## Dữ liệu lưu trữ

Tất cả dữ liệu lưu trên máy người dùng, không có server:

```
~/.awesome-fb/
├── config.json   # Danh sách pages và access token
├── drafts.json   # Bài viết nháp
└── images/       # Ảnh đã tải về
```

> **Lưu ý bảo mật:** Access token lưu plain text. Giữ bí mật thư mục `~/.awesome-fb/`.

---

## Xử lý lỗi thường gặp

| Lỗi | Cách xử lý |
|---|---|
| `Chưa có page nào` | Chạy `fb-post add-page` trước |
| `Token hết hạn` | Lấy token mới rồi chạy lại `fb-post add-page` |
| `Thiếu UNSPLASH_ACCESS_KEY` | Thêm key vào file `.env` |
| `Page ID không tồn tại` | Kiểm tra lại Page ID trên Facebook |
| `Không thể mở preview` | Kiểm tra đường dẫn ảnh có tồn tại không |
