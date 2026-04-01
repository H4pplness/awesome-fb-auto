---
name: fb-post
description: Trợ lý cho CLI tool awesome-fb — hỗ trợ chạy lệnh, debug, thêm adapter ảnh mới, quản lý nháp, và mở rộng tính năng. Dùng khi làm việc với project fbtool.
argument-hint: "[run | debug | new-adapter | help]"
allowed-tools: Read, Grep, Glob, Bash(node *), Bash(npm *)
---

# Trợ lý awesome-fb CLI

Project: **awesome-fb** — CLI tool đăng bài lên Facebook Page, viết bằng Node.js ES Modules.

## Snapshot trạng thái hiện tại

!`cd "c:/Users/dongt/agent platform/cli-tools/fbtool" && node bin/fb-post.js --help 2>&1`

## Source files

!`find "c:/Users/dongt/agent platform/cli-tools/fbtool/src" -name "*.js" | sort`

---

## Hành động theo `$ARGUMENTS`

### `run` hoặc không có argument — hướng dẫn sử dụng

**Tổng quan lệnh:**

```bash
# Pages
fb-post add-page
fb-post list-pages

# Tìm ảnh
fb-post search-image -q "từ khóa" [-s unsplash|pexels] [-n 5]

# Đăng bài — interactive
fb-post post

# Đăng bài — 1 dòng không cần prompt
fb-post post -p "Trang chính" -m "Nội dung" --no-preview -y
fb-post post -p "Shop A" -m "Flash sale!" -i "/path/anh.jpg" --no-preview -y

# Bài nháp
fb-post draft              # menu tổng hợp
fb-post draft save         # lưu nháp mới
fb-post draft list         # xem danh sách
fb-post draft preview      # mở preview trình duyệt
fb-post draft delete       # xóa nháp
```

**Flags của `post`:**

| Flag | Tác dụng |
|---|---|
| `-p, --page <name>` | Tên gợi nhớ page, bỏ qua prompt chọn |
| `-m, --message <text>` | Nội dung bài, bỏ qua editor |
| `-i, --image <path>` | Đường dẫn ảnh local |
| `--no-preview` | Bỏ qua bước mở preview trình duyệt |
| `-y, --yes` | Tự xác nhận, không hỏi lại |

---

### `debug` — kiểm tra môi trường

Node.js và dependencies:

!`cd "c:/Users/dongt/agent platform/cli-tools/fbtool" && node --version && npm list --depth=0 2>&1`

Config pages đã lưu:

!`cat "$USERPROFILE/.awesome-fb/config.json" 2>/dev/null || cat "$HOME/.awesome-fb/config.json" 2>/dev/null || echo "(Chưa có config — chạy add-page trước)"`

Bài nháp đã lưu:

!`cat "$USERPROFILE/.awesome-fb/drafts.json" 2>/dev/null || cat "$HOME/.awesome-fb/drafts.json" 2>/dev/null || echo "(Chưa có nháp nào)"`

Biến môi trường API keys:

!`cd "c:/Users/dongt/agent platform/cli-tools/fbtool" && node -e "import('dotenv/config').then(() => { console.log('UNSPLASH_ACCESS_KEY:', process.env.UNSPLASH_ACCESS_KEY ? '✔ đã set' : '✖ chưa set'); console.log('PEXELS_API_KEY:', process.env.PEXELS_API_KEY ? '✔ đã set' : '✖ chưa set'); })" 2>&1`

---

### `new-adapter` — thêm nguồn ảnh mới

Đọc interface và registry hiện tại:

!`cat "c:/Users/dongt/agent platform/cli-tools/fbtool/src/adapters/image-adapter.js"`

!`cat "c:/Users/dongt/agent platform/cli-tools/fbtool/src/adapters/adapter-registry.js"`

Hướng dẫn tạo adapter mới:
1. Tạo `src/adapters/<ten>-adapter.js`, extend `ImageAdapter`, implement `search()` và `download()`
2. Đăng ký trong `adapter-registry.js`: thêm `<ten>: () => new <Ten>Adapter()` vào object `registry`
3. Thêm env var hướng dẫn vào README nếu cần API key

Tham khảo `unsplash-adapter.js` làm mẫu:

!`cat "c:/Users/dongt/agent platform/cli-tools/fbtool/src/adapters/unsplash-adapter.js"`

---

### `help` — hiển thị README đầy đủ

!`cat "c:/Users/dongt/agent platform/cli-tools/fbtool/README.md"`

---

## Kiến trúc & nguyên tắc

```
bin/fb-post.js          Entry point, parse args (commander)
src/commands/
  post.js               Đăng bài — hỗ trợ flags + tải từ nháp
  draft.js              CRUD nháp + preview
  add-page.js           Thêm/cập nhật page (verify qua Graph API)
  list-pages.js         Bảng danh sách pages
  search-image.js       Tìm & tải ảnh qua adapter
src/adapters/
  image-adapter.js      Base class (search, download)
  unsplash-adapter.js   Unsplash
  pexels-adapter.js     Pexels
  adapter-registry.js   Map source → adapter instance
src/services/
  facebook.js           Graph API: verifyPage, postText, postPhoto
  storage.js            CRUD: pages (config.json) + drafts (drafts.json)
src/utils/
  config.js             Đường dẫn ~/.awesome-fb/*
  logger.js             chalk logger (success/error/warn/info/dim)
  preview.js            Generate HTML + mở trình duyệt (package: open)
```

**Quy tắc bắt buộc:**
1. **Adapter** — nguồn ảnh mới phải implement `ImageAdapter`, đăng ký trong `adapter-registry.js`
2. **Storage** — chỉ đọc/ghi qua `services/storage.js`, không thao tác file trực tiếp
3. **Facebook API** — mọi call đều qua `services/facebook.js`
4. **ES Modules** — `"type": "module"` trong package.json, luôn dùng `.js` extension khi import
5. **Logger** — dùng `logger` từ `utils/logger.js`, không dùng `console.log` thô trong commands
