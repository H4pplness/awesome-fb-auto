import inquirer from 'inquirer';
import ora from 'ora';
import { verifyPage } from '../services/facebook.js';
import { getPages, addPage, updatePage } from '../services/storage.js';
import { logger } from '../utils/logger.js';

export async function addPageCommand() {
  const { pageId, accessToken } = await inquirer.prompt([
    {
      type: 'input',
      name: 'pageId',
      message: 'Nhập Page ID:',
      validate: (v) => v.trim() !== '' || 'Page ID không được để trống',
    },
    {
      type: 'password',
      name: 'accessToken',
      message: 'Nhập Access Token của page:',
      mask: '*',
      validate: (v) => v.trim() !== '' || 'Access Token không được để trống',
    },
  ]);

  const spinner = ora('Đang xác minh page với Facebook...').start();
  let pageInfo;
  try {
    pageInfo = await verifyPage(pageId.trim(), accessToken.trim());
    spinner.succeed(`Page hợp lệ: ${pageInfo.name}`);
  } catch (err) {
    spinner.fail('Xác minh thất bại.');
    const msg = err.response?.data?.error?.message || err.message;
    logger.error(msg);
    return;
  }

  const pages = await getPages();
  const existing = pages.find((p) => p.id === pageInfo.id);

  if (existing) {
    const { update } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'update',
        message: `Page "${existing.name}" đã tồn tại. Bạn có muốn cập nhật token không?`,
        default: false,
      },
    ]);
    if (update) {
      await updatePage(pageInfo.id, { accessToken: accessToken.trim() });
      logger.success('Đã cập nhật token thành công.');
    } else {
      logger.info('Hủy thao tác.');
    }
    return;
  }

  const { nickname } = await inquirer.prompt([
    {
      type: 'input',
      name: 'nickname',
      message: 'Đặt tên gợi nhớ cho page này:',
      default: pageInfo.name,
      validate: (v) => v.trim() !== '' || 'Tên không được để trống',
    },
  ]);

  await addPage({
    id: pageInfo.id,
    name: nickname.trim(),
    accessToken: accessToken.trim(),
    addedAt: new Date().toISOString(),
  });

  logger.success(`Đã thêm page "${nickname}" thành công!`);
}
