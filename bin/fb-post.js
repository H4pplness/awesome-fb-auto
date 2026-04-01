#!/usr/bin/env node
import 'dotenv/config';
import { program } from 'commander';
import { addPageCommand } from '../src/commands/add-page.js';
import { listPagesCommand } from '../src/commands/list-pages.js';
import { searchImageCommand } from '../src/commands/search-image.js';
import { postCommand } from '../src/commands/post.js';

program
  .name('fb-post')
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
  .option('-n, --count <number>', 'Số lượng ảnh hiển thị', '5')
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

program.parse(process.argv);
