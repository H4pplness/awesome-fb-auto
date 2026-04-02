import inquirer from 'inquirer';
import ora from 'ora';
import path from 'path';
import { getAdapter } from '../adapters/adapter-registry.js';
import { IMAGES_DIR } from '../services/storage.js';
import { logger } from '../utils/logger.js';

export async function searchImageCommand(options) {
  const { query, source = 'unsplash', count = 5, auto } = options;

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

  // Chế độ tự động: tải N ảnh đầu tiên không cần chọn
  if (auto !== undefined) {
    const autoCount = Math.min(Number(auto), results.length);
    const targets = results.slice(0, autoCount);
    const savedPaths = [];

    const dlSpinner = ora(`Đang tự động tải ${autoCount} ảnh đầu tiên...`).start();
    for (const img of targets) {
      const destPath = path.join(IMAGES_DIR, `${img.id}.jpg`);
      try {
        await adapter.download(img.downloadUrl, destPath);
        savedPaths.push(destPath);
        dlSpinner.text = `Đã tải ${savedPaths.length}/${autoCount}: ${img.description || img.id}`;
      } catch (err) {
        logger.warn(`Bỏ qua ảnh ${img.id}: ${err.message}`);
      }
    }
    dlSpinner.succeed(`Đã lưu ${savedPaths.length} ảnh vào ${IMAGES_DIR}`);
    savedPaths.forEach((p) => logger.dim(p));
    return savedPaths;
  }

  // Chế độ interactive: hiển thị danh sách cho người dùng chọn
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
