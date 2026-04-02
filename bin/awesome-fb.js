#!/usr/bin/env node
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
config({ path: join(dirname(fileURLToPath(import.meta.url)), '../.env') });
import { program } from 'commander';
import { addPageCommand } from '../src/commands/add-page.js';
import { listPagesCommand } from '../src/commands/list-pages.js';
import { searchImageCommand } from '../src/commands/search-image.js';
import { postCommand } from '../src/commands/post.js';
import { draftMenuCommand, draftListCommand, draftSaveCommand, draftPreviewCommand, draftDeleteCommand } from '../src/commands/draft.js';

program
  .name('awesome-fb')
  .description('CLI tool để quản lý và đăng bài lên Facebook Page')
  .version('1.0.0');

program
  .command('add-page')
  .description('Thêm một Facebook Page mới')
  .action(addPageCommand);

program
  .command('list-pages')
  .description('Liệt kê tất cả Facebook Pages đã lưu')
  .action(listPagesCommand);

program
  .command('search-image')
  .description('Tìm kiếm và tải ảnh từ Unsplash / Pexels')
  .requiredOption('-q, --query <query>', 'Từ khóa tìm kiếm')
  .option('-s, --source <source>', 'Nguồn ảnh (unsplash, pexels)', 'unsplash')
  .option('-n, --count <number>', 'Số lượng ảnh tìm kiếm', '5')
  .option('-a, --auto <number>', 'Tự động tải N ảnh đầu tiên, không cần chọn')
  .action((options) => searchImageCommand(options));

program
  .command('post')
  .description('Tạo và đăng bài lên Facebook Page')
  .option('-p, --page <name>', 'Tên gợi nhớ của page (bỏ qua prompt chọn page)')
  .option('-m, --message <text>', 'Nội dung bài viết (bỏ qua editor)')
  .option('-i, --image <path>', 'Đường dẫn ảnh local (bỏ qua prompt ảnh)')
  .option('--no-preview', 'Bỏ qua bước preview')
  .option('-y, --yes', 'Tự động xác nhận, không hỏi lại')
  .action((options) => postCommand(options));

const draft = program
  .command('draft')
  .description('Quản lý bài viết nháp')
  .action(draftMenuCommand);

draft
  .command('list')
  .description('Xem danh sách bài nháp')
  .action(draftListCommand);

draft
  .command('save')
  .description('Lưu bài viết mới vào nháp')
  .option('-t, --title <title>', 'Tiêu đề bài nháp')
  .option('-m, --message <text>', 'Nội dung bài viết (bỏ qua editor)')
  .option('-i, --image <path>', 'Đường dẫn ảnh local')
  .action((options) => draftSaveCommand(options));

draft
  .command('preview')
  .description('Preview bài nháp trong trình duyệt')
  .action(draftPreviewCommand);

draft
  .command('delete')
  .description('Xóa bài nháp')
  .action(draftDeleteCommand);

program.parse(process.argv);
