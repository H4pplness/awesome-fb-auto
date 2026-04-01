import inquirer from 'inquirer';
import chalk from 'chalk';
import Table from 'cli-table3';
import { getDrafts, saveDraft, updateDraft, deleteDraft } from '../services/storage.js';
import { openPreview } from '../utils/preview.js';
import { logger } from '../utils/logger.js';

// ── Hiển thị bảng danh sách nháp ─────────────────────────────────────────────

export async function draftListCommand() {
  const drafts = await getDrafts();
  if (drafts.length === 0) {
    logger.warn('Chưa có bài nháp nào. Chạy: fb-post draft save');
    return;
  }

  const table = new Table({
    head: [chalk.bold('#'), chalk.bold('Tiêu đề'), chalk.bold('Nội dung (preview)'), chalk.bold('Ảnh'), chalk.bold('Cập nhật lúc')],
    style: { head: ['cyan'] },
    colWidths: [4, 22, 35, 6, 20],
    wordWrap: true,
  });

  drafts.forEach((d, i) => {
    const preview = d.content.replace(/\n/g, ' ').slice(0, 60) + (d.content.length > 60 ? '…' : '');
    const date = new Date(d.updatedAt).toLocaleString('vi-VN');
    table.push([i + 1, d.title, preview, d.imagePath ? '✔' : '—', date]);
  });

  console.log('\n' + chalk.bold('Danh sách bài nháp'));
  console.log(table.toString());
  logger.dim(`Tổng: ${drafts.length} bài nháp`);
}

// ── Lưu bài nháp mới ──────────────────────────────────────────────────────────

export async function draftSaveCommand(prefill = {}) {
  const { title } = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Tiêu đề bài nháp (để gợi nhớ):',
      default: prefill.title,
      validate: (v) => v.trim() !== '' || 'Tiêu đề không được để trống',
    },
  ]);

  let content = prefill.content;
  if (!content) {
    const answer = await inquirer.prompt([
      {
        type: 'editor',
        name: 'content',
        message: 'Nhập nội dung bài viết (sẽ mở editor):',
        validate: (v) => v.trim() !== '' || 'Nội dung không được để trống',
      },
    ]);
    content = answer.content;
  }

  const { wantImage } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'wantImage',
      message: 'Đính kèm đường dẫn ảnh không?',
      default: !!prefill.imagePath,
    },
  ]);

  let imagePath = null;
  if (wantImage) {
    const { localPath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'localPath',
        message: 'Đường dẫn file ảnh:',
        default: prefill.imagePath || '',
        validate: (v) => v.trim() !== '' || 'Đường dẫn không được để trống',
      },
    ]);
    imagePath = localPath.trim();
  }

  const draft = await saveDraft({ title: title.trim(), content: content.trim(), imagePath });
  logger.success(`Đã lưu nháp "${draft.title}" (id: ${draft.id.slice(0, 8)}…)`);
  return draft;
}

// ── Preview bài nháp ──────────────────────────────────────────────────────────

export async function draftPreviewCommand() {
  const drafts = await getDrafts();
  if (drafts.length === 0) {
    logger.warn('Chưa có bài nháp nào.');
    return;
  }

  const { draft } = await inquirer.prompt([
    {
      type: 'list',
      name: 'draft',
      message: 'Chọn bài nháp để preview:',
      choices: drafts.map((d) => ({
        name: `${d.title}  ${chalk.dim(new Date(d.updatedAt).toLocaleString('vi-VN'))}`,
        value: d,
      })),
    },
  ]);

  await openPreview({
    pageName: draft.title,
    content: draft.content,
    imagePath: draft.imagePath,
  });
  logger.success('Đã mở preview trong trình duyệt.');
}

// ── Xóa bài nháp ─────────────────────────────────────────────────────────────

export async function draftDeleteCommand() {
  const drafts = await getDrafts();
  if (drafts.length === 0) {
    logger.warn('Chưa có bài nháp nào.');
    return;
  }

  const { draft } = await inquirer.prompt([
    {
      type: 'list',
      name: 'draft',
      message: 'Chọn bài nháp muốn xóa:',
      choices: drafts.map((d) => ({
        name: `${d.title}  ${chalk.dim(new Date(d.updatedAt).toLocaleString('vi-VN'))}`,
        value: d,
      })),
    },
  ]);

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Xác nhận xóa nháp "${draft.title}"?`,
      default: false,
    },
  ]);

  if (!confirm) { logger.info('Đã hủy.'); return; }

  await deleteDraft(draft.id);
  logger.success(`Đã xóa nháp "${draft.title}".`);
}

// ── Menu tổng hợp (fb-post draft không có subcommand) ─────────────────────────

export async function draftMenuCommand() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Quản lý bài nháp — chọn thao tác:',
      choices: [
        { name: 'Xem danh sách nháp', value: 'list' },
        { name: 'Lưu bài nháp mới', value: 'save' },
        { name: 'Preview bài nháp', value: 'preview' },
        { name: 'Xóa bài nháp', value: 'delete' },
      ],
    },
  ]);

  if (action === 'list') return draftListCommand();
  if (action === 'save') return draftSaveCommand();
  if (action === 'preview') return draftPreviewCommand();
  if (action === 'delete') return draftDeleteCommand();
}
