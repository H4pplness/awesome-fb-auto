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

> Trên Windows với Git Bash, nếu `awesome-fb` không nhận sau `npm link`, thêm alias vào `~/.bashrc`:
> ```bash
> alias awesome-fb="node '/path/to/fbtool/bin/awesome-fb.js'"
> ```

---

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
awesome-fb add-page                                  Thêm Facebook Page mới
awesome-fb list-pages                                Xem danh sách pages đã lưu

awesome-fb search-image -q <từ khóa>                Tìm ảnh, chọn thủ công
awesome-fb search-image -q <từ khóa> -a <n>         Tự động tải N ảnh đầu tiên

awesome-fb post                                      Đăng bài (interactive)
awesome-fb post -p <page> -m <nội dung> -y           Đăng bài nhanh 1 dòng

awesome-fb draft                                     Menu quản lý bài nháp
awesome-fb draft save                                Lưu bài nháp mới
awesome-fb draft list                                Xem danh sách nháp
awesome-fb draft preview                             Preview bài nháp trong trình duyệt
awesome-fb draft delete                              Xóa bài nháp
```

---

## Quản lý Pages

### Thêm page

```bash
awesome-fb add-page
```

1. Nhập **Page ID** — phần số trong URL trang Facebook
2. Nhập **Access Token** — lấy từ [Graph API Explorer](https://developers.facebook.com/tools/explorer/), chọn page rồi copy token
3. CLI tự xác minh với Facebook, hiển thị tên page thật
4. Đặt **tên gợi nhớ** để phân biệt khi có nhiều page

Nếu page đã tồn tại, CLI hỏi có muốn cập nhật token mới không.

### Xem danh sách pages

```bash
awesome-fb list-pages
```

---

## Tìm kiếm ảnh

```bash
awesome-fb search-image --query "coffee morning"
```

| Flag | Mô tả | Mặc định |
|---|---|---|
| `-q, --query` | Từ khóa tìm kiếm **(bắt buộc)** | — |
| `-s, --source` | Nguồn ảnh: `unsplash`, `pexels` | `unsplash` |
| `-n, --count` | Số lượng ảnh tìm kiếm | `5` |
| `-a, --auto` | Tự động tải N ảnh đầu tiên, không cần chọn | — |

Ảnh tải về lưu tại `~/.awesome-fb/images/`.

### Chế độ thủ công (mặc định)

Hiển thị danh sách ảnh tìm được, người dùng chọn 1 ảnh để tải:

```bash
awesome-fb search-image --query "nature sunset" --source pexels --count 10
```

### Chế độ tự động (`--auto`)

Bỏ qua bước chọn, tự động tải N ảnh đầu tiên ngay sau khi tìm kiếm:

```bash
# Tải 3 ảnh đầu tiên tự động
awesome-fb search-image --query "coffee" --auto 3

# Tìm 20 ảnh, tự động tải 5 ảnh đầu
awesome-fb search-image --query "nature" --count 20 --auto 5
```

CLI hiển thị tiến trình từng ảnh đang tải và in đường dẫn từng file khi xong.

---

## Đăng bài

### Interactive

```bash
awesome-fb post
```

Luồng thực hiện:
1. Nếu có bài nháp → hỏi có muốn tải từ nháp không
2. Chọn page muốn đăng
3. Nhập nội dung bài viết (mở editor)
4. Chọn có đính kèm ảnh không: tìm qua Unsplash/Pexels hoặc nhập đường dẫn local
5. Preview bài trong trình duyệt (giả lập giao diện Facebook)
6. Xác nhận rồi đăng

### Đăng nhanh 1 dòng

```bash
# Chỉ text
awesome-fb post -p "Trang chính" -m "Nội dung bài viết" --no-preview -y

# Kèm ảnh local
awesome-fb post -p "Shop A" -m "Flash sale hôm nay!" -i "/path/to/anh.jpg" --no-preview -y

# Bỏ qua chọn page, vẫn mở editor nhập nội dung
awesome-fb post -p "Trang chính"
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
awesome-fb draft           # Menu tổng hợp
awesome-fb draft save      # Lưu bài nháp mới (interactive)
awesome-fb draft list      # Xem danh sách nháp (tiêu đề, preview nội dung, ngày cập nhật)
awesome-fb draft preview   # Preview bài nháp trong trình duyệt
awesome-fb draft delete    # Xóa bài nháp (có xác nhận)
```

### Tạo nháp nhanh 1 dòng

```bash
# Đủ --title và --message → lưu ngay, không hỏi gì
awesome-fb draft save -t "Flash sale tháng 4" -m "Giảm 50% toàn bộ sản phẩm hôm nay!"

# Kèm ảnh
awesome-fb draft save -t "Bài cuối tuần" -m "Chúc mừng cuối tuần!" -i "/path/anh.jpg"

# Dùng một phần — chỉ điền title, vẫn mở editor nhập nội dung
awesome-fb draft save -t "Ý tưởng mới"
```

| Flag | Mô tả |
|---|---|
| `-t, --title <title>` | Tiêu đề bài nháp |
| `-m, --message <text>` | Nội dung bài — bỏ qua editor |
| `-i, --image <path>` | Đường dẫn ảnh local |

Khi chạy `awesome-fb post`, nếu có bài nháp CLI sẽ hỏi:

```
? Bạn có 2 bài nháp. Tải nội dung từ bài nháp? (y/N)
```

Chọn nháp xong tự điền nội dung và ảnh, không cần nhập lại từ đầu.

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
| `Chưa có page nào` | Chạy `awesome-fb add-page` trước |
| `Token hết hạn` | Lấy token mới rồi chạy lại `awesome-fb add-page` |
| `Thiếu UNSPLASH_ACCESS_KEY` | Thêm key vào file `.env` |
| `Page ID không tồn tại` | Kiểm tra lại Page ID trên Facebook |
| `Không thể mở preview` | Kiểm tra đường dẫn ảnh có tồn tại không |
| `command not found: awesome-fb` | Chạy `npm link` hoặc thêm alias vào `~/.bashrc` |
