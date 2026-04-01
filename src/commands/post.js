import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { getPages, getDrafts } from '../services/storage.js';
import { postText, postPhoto } from '../services/facebook.js';
import { searchImageCommand } from './search-image.js';
import { logger } from '../utils/logger.js';
import { openPreview } from '../utils/preview.js';

export async function postCommand(options = {}) {
  const pages = await getPages();

  if (pages.length === 0) {
    logger.error('Chưa có page nào. Vui lòng chạy: fb-post add-page');
    return;
  }

  // --- Chọn page ---
  let page;
  if (options.page) {
    page = pages.find((p) => p.name.toLowerCase() === options.page.toLowerCase());
    if (!page) {
      logger.error(`Không tìm thấy page tên "${options.page}". Chạy fb-post list-pages để xem danh sách.`);
      return;
    }
  } else {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'page',
        message: 'Chọn Facebook Page để đăng bài:',
        choices: pages.map((p) => ({ name: `${p.name} (${p.id})`, value: p })),
      },
    ]);
    page = answer.page;
  }

  // --- Tải từ bài nháp (nếu không có --message) ---
  let draftImagePath = null;
  if (!options.message && !options.image) {
    const drafts = await getDrafts();
    if (drafts.length > 0) {
      const { useDraft } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'useDraft',
          message: `Bạn có ${drafts.length} bài nháp. Tải nội dung từ bài nháp?`,
          default: false,
        },
      ]);
      if (useDraft) {
        const { draft } = await inquirer.prompt([
          {
            type: 'list',
            name: 'draft',
            message: 'Chọn bài nháp:',
            choices: drafts.map((d) => ({
              name: `${d.title}  ${chalk.dim(new Date(d.updatedAt).toLocaleString('vi-VN'))}`,
              value: d,
            })),
          },
        ]);
        options.message = draft.content;
        draftImagePath = draft.imagePath;
      }
    }
  }

  // --- Nhập nội dung ---
  let content;
  if (options.message) {
    content = options.message;
  } else {
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

  // --- Chọn ảnh ---
  let imagePath = options.image || draftImagePath || null;
  if (imagePath) {
    logger.info(`Dùng ảnh: ${imagePath}`);
  } else {
    const { wantImage } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'wantImage',
        message: 'Bạn có muốn đính kèm ảnh không?',
        default: false,
      },
    ]);

    if (wantImage) {
      const { imageSource } = await inquirer.prompt([
        {
          type: 'list',
          name: 'imageSource',
          message: 'Chọn nguồn ảnh:',
          choices: [
            { name: 'Tìm ảnh qua Unsplash / Pexels', value: 'search' },
            { name: 'Nhập đường dẫn ảnh local', value: 'local' },
          ],
        },
      ]);

      if (imageSource === 'search') {
        const { query, source } = await inquirer.prompt([
          {
            type: 'input',
            name: 'query',
            message: 'Từ khóa tìm kiếm ảnh:',
            validate: (v) => v.trim() !== '' || 'Từ khóa không được để trống',
          },
          {
            type: 'list',
            name: 'source',
            message: 'Chọn nguồn ảnh:',
            choices: ['unsplash', 'pexels'],
            default: 'unsplash',
          },
        ]);
        imagePath = await searchImageCommand({ query, source });
      } else {
        const { localPath } = await inquirer.prompt([
          {
            type: 'input',
            name: 'localPath',
            message: 'Nhập đường dẫn đầy đủ đến file ảnh:',
            validate: (v) => v.trim() !== '' || 'Đường dẫn không được để trống',
          },
        ]);
        imagePath = localPath.trim();
      }
    }
  }

  // --- Tóm tắt ---
  console.log('\n' + chalk.bold('--- Xác nhận thông tin bài đăng ---'));
  console.log(chalk.cyan('Page:') + ' ' + page.name);
  console.log(chalk.cyan('Nội dung:') + '\n' + content.trim());
  if (imagePath) console.log(chalk.cyan('Ảnh:') + ' ' + imagePath);
  console.log('-----------------------------------\n');

  // --- Preview ---
  if (options.preview !== false) {
    const doPreview = options.yes
      ? false
      : (await inquirer.prompt([{ type: 'confirm', name: 'v', message: 'Mở preview bài viết trong trình duyệt?', default: true }])).v;

    if (doPreview) {
      const previewSpinner = ora('Đang tạo file preview...').start();
      try {
        await openPreview({ pageName: page.name, content: content.trim(), imagePath });
        previewSpinner.succeed('Đã mở preview trong trình duyệt.');
      } catch (err) {
        previewSpinner.fail('Không thể mở preview: ' + err.message);
      }
    }
  }

  // --- Xác nhận ---
  if (!options.yes) {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Xác nhận đăng bài?',
        default: true,
      },
    ]);
    if (!confirm) {
      logger.info('Đã hủy đăng bài.');
      return;
    }
  }

  // --- Đăng bài ---
  const spinner = ora('Đang đăng bài lên Facebook...').start();
  try {
    let result;
    if (imagePath) {
      result = await postPhoto(page.id, page.accessToken, content.trim(), imagePath);
    } else {
      result = await postText(page.id, page.accessToken, content.trim());
    }

    const postId = result.post_id || result.id;
    spinner.succeed('Đăng bài thành công!');
    logger.info(`Post ID: ${postId}`);
    logger.info(`Link bài viết: https://www.facebook.com/${postId.replace('_', '/posts/')}`);
  } catch (err) {
    spinner.fail('Đăng bài thất bại.');
    const msg = err.response?.data?.error?.message || err.message;
    logger.error(msg);
  }
}
