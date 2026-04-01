import Table from 'cli-table3';
import chalk from 'chalk';
import { getPages } from '../services/storage.js';
import { logger } from '../utils/logger.js';

export async function listPagesCommand() {
  const pages = await getPages();

  if (pages.length === 0) {
    logger.warn('Chưa có page nào. Chạy lệnh: fb-post add-page');
    return;
  }

  const table = new Table({
    head: [
      chalk.bold('#'),
      chalk.bold('Tên gợi nhớ'),
      chalk.bold('Page ID'),
      chalk.bold('Ngày thêm'),
    ],
    style: { head: ['cyan'] },
  });

  pages.forEach((page, idx) => {
    const date = new Date(page.addedAt).toLocaleDateString('vi-VN');
    table.push([idx + 1, page.name, page.id, date]);
  });

  console.log('\n' + chalk.bold('Danh sách Facebook Pages đã lưu'));
  console.log(table.toString());
  logger.dim(`Tổng: ${pages.length} page(s)`);
}
