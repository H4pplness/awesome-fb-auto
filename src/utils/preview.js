import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import open from 'open';

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>');
}

function imageTag(imagePath) {
  if (!imagePath) return '';
  const ext = path.extname(imagePath).slice(1).toLowerCase() || 'jpeg';
  const mimeType = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  try {
    const data = fs.readFileSync(imagePath);
    const base64 = data.toString('base64');
    return `<img src="data:${mimeType};base64,${base64}" alt="Post image">`;
  } catch {
    return `<p class="img-error">⚠ Không thể tải ảnh: ${escapeHtml(imagePath)}</p>`;
  }
}

export async function openPreview({ pageName, content, imagePath }) {
  const now = new Date().toLocaleString('vi-VN');

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview bài viết — ${escapeHtml(pageName)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #f0f2f5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 16px;
      min-height: 100vh;
    }
    .label {
      font-size: 13px;
      color: #65676b;
      margin-bottom: 12px;
      letter-spacing: 0.3px;
    }
    .card {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,.15);
      width: 100%;
      max-width: 520px;
      overflow: hidden;
    }
    .card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
    }
    .avatar {
      width: 40px; height: 40px;
      border-radius: 50%;
      background: #1877f2;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; color: #fff; font-weight: 700;
      flex-shrink: 0;
    }
    .page-info { flex: 1; }
    .page-name { font-weight: 600; font-size: 15px; color: #050505; }
    .post-time { font-size: 12px; color: #65676b; margin-top: 1px; }
    .content {
      padding: 0 16px 12px;
      font-size: 15px;
      line-height: 1.6;
      color: #050505;
      white-space: pre-wrap;
    }
    .card img {
      width: 100%;
      display: block;
      max-height: 500px;
      object-fit: cover;
    }
    .img-error {
      padding: 16px;
      color: #e74c3c;
      font-size: 13px;
      background: #fff5f5;
    }
    .card-footer {
      padding: 8px 16px;
      border-top: 1px solid #e4e6eb;
      display: flex;
      gap: 4px;
    }
    .reaction {
      flex: 1; padding: 6px;
      background: none; border: none; border-radius: 4px;
      font-size: 14px; color: #65676b; font-weight: 600;
      cursor: default; text-align: center;
    }
    .badge {
      display: inline-block;
      background: #fff3cd;
      border: 1px solid #ffc107;
      color: #856404;
      border-radius: 20px;
      padding: 4px 14px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 16px;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <p class="label">Preview bài viết trước khi đăng</p>
  <span class="badge">PREVIEW — chưa đăng</span>

  <div class="card">
    <div class="card-header">
      <div class="avatar">${escapeHtml(pageName.charAt(0).toUpperCase())}</div>
      <div class="page-info">
        <div class="page-name">${escapeHtml(pageName)}</div>
        <div class="post-time">${now} · 🌐</div>
      </div>
    </div>

    <div class="content">${escapeHtml(content)}</div>

    ${imageTag(imagePath)}

    <div class="card-footer">
      <span class="reaction">👍 Thích</span>
      <span class="reaction">💬 Bình luận</span>
      <span class="reaction">↗ Chia sẻ</span>
    </div>
  </div>
</body>
</html>`;

  const tmpFile = path.join(os.tmpdir(), `fb-preview-${Date.now()}.html`);
  await fs.writeFile(tmpFile, html, 'utf-8');
  await open(tmpFile);
  return tmpFile;
}
