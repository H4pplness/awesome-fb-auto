import inquirer from 'inquirer';
import ora from 'ora';
import path from 'path';
import { getAdapter } from '../adapters/adapter-registry.js';
import { IMAGES_DIR } from '../services/storage.js';
import { logger } from '../utils/logger.js';

export async function searchImageCommand(options) {
  const { query, source = 'unsplash', count = 5 } = options;

  let adapter;
  try {
    adapter = getAdapter(source);
  } catch (err) {
    logger.error(err.message);
    return;
  }

  const spinner = ora(`Đang tìm kiếm ảnh trên ${source}...`).start();
  let results;
  try {
    results = await adapter.search(query, Number(count));
    spinner.succeed(`Tìm thấy ${results.length} ảnh.`);
  } catch (err) {
    spinner.fail('Tìm kiếm thất bại.');
    logger.error(err.message);
    return;
  }

  if (results.length === 0) {
    logger.warn('Không tìm thấy ảnh nào phù hợp.');
    return;
  }

  const choices = results.map((img) => ({
    name: `[${img.sourceName}] ${img.description} — by ${img.author}\n    ${img.thumbUrl}`,
    value: img,
  }));

  const { selected } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selected',
      message: 'Chọn ảnh muốn tải về:',
      choices,
      pageSize: 10,
    },
  ]);

  const filename = `${selected.id}.jpg`;
  const destPath = path.join(IMAGES_DIR, filename);

  const dlSpinner = ora('Đang tải ảnh về...').start();
  try {
    await adapter.download(selected.downloadUrl, destPath);
    dlSpinner.succeed(`Đã lưu ảnh tại: ${destPath}`);
    return destPath;
  } catch (err) {
    dlSpinner.fail('Tải ảnh thất bại.');
    logger.error(err.message);
  }
}
