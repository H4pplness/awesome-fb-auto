---
name: fb-post
description: Trợ lý cho CLI tool awesome-fb — hỗ trợ chạy lệnh, debug, thêm adapter mới, và mở rộng tính năng. Dùng khi làm việc với project fbtool.
argument-hint: "[lệnh: run | debug | new-adapter | help]"
allowed-tools: Read, Grep, Glob, Bash(node *), Bash(npm *)
---

# Trợ lý awesome-fb CLI

Project hiện tại là **awesome-fb** — CLI tool đăng bài lên Facebook Page.

## Cấu trúc project

!`ls c:/Users/dongt/agent\ platform/cli-tools/fbtool/src --recursive 2>/dev/null || find "c:/Users/dongt/agent platform/cli-tools/fbtool/src" -type f -name "*.js" 2>/dev/null | head -30`

## Trạng thái hiện tại

!`cd "c:/Users/dongt/agent platform/cli-tools/fbtool" && node bin/fb-post.js --help 2>&1`

---

## Hành động theo argument

### Nếu `$ARGUMENTS` là `run` hoặc không có argument

Hướng dẫn người dùng chạy các lệnh CLI:

```bash
# Từ thư mục project
node bin/fb-post.js add-page
node bin/fb-post.js list-pages
node bin/fb-post.js search-image --query "từ khóa"
node bin/fb-post.js post

# Sau khi cài global (npm link hoặc npm install -g .)
fb-post add-page
fb-post list-pages
```

### Nếu `$ARGUMENTS` là `debug`

Chạy kiểm tra nhanh môi trường:

!`cd "c:/Users/dongt/agent platform/cli-tools/fbtool" && node --version && npm list --depth=0 2>&1`

Kiểm tra config đã lưu:

!`cat "$HOME/.awesome-fb/config.json" 2>/dev/null || echo "(Chưa có config — chạy add-page trước)"`

Kiểm tra biến môi trường:

!`cd "c:/Users/dongt/agent platform/cli-tools/fbtool" && node -e "import('dotenv/config').then(() => { console.log('UNSPLASH_ACCESS_KEY:', process.env.UNSPLASH_ACCESS_KEY ? '✔ đã set' : '✖ chưa set'); console.log('PEXELS_API_KEY:', process.env.PEXELS_API_KEY ? '✔ đã set' : '✖ chưa set'); })" 2>&1`

### Nếu `$ARGUMENTS` là `new-adapter`

Hướng dẫn và tạo scaffold cho adapter mới.

Đọc interface hiện tại:

!`cat "c:/Users/dongt/agent platform/cli-tools/fbtool/src/adapters/image-adapter.js"`

Đọc adapter registry:

!`cat "c:/Users/dongt/agent platform/cli-tools/fbtool/src/adapters/adapter-registry.js"`

Sau đó tạo file `src/adapters/<ten>-adapter.js` theo đúng pattern của `unsplash-adapter.js` rồi đăng ký vào `adapter-registry.js`.

### Nếu `$ARGUMENTS` là `help`

Hiển thị toàn bộ hướng dẫn sử dụng từ README:

!`cat "c:/Users/dongt/agent platform/cli-tools/fbtool/README.md"`

---

## Nguyên tắc khi làm việc với project này

1. **Adapter pattern** — mọi nguồn ảnh mới phải implement `search()` và `download()` từ `ImageAdapter`, đăng ký trong `adapter-registry.js`
2. **Storage** — chỉ đọc/ghi qua `services/storage.js`, không trực tiếp thao tác file config
3. **Facebook API** — mọi call đều qua `services/facebook.js`, không gọi axios trực tiếp từ command
4. **ES Modules** — project dùng `"type": "module"`, luôn dùng `.js` extension khi import
5. **Error UX** — luôn dùng `logger` từ `utils/logger.js` để hiển thị lỗi, không `console.log` thô
