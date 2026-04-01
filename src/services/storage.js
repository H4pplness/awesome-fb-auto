import fs from 'fs-extra';
import { CONFIG_DIR, CONFIG_FILE, IMAGES_DIR } from '../utils/config.js';
import { logger } from '../utils/logger.js';

async function ensureConfigDir() {
  await fs.ensureDir(CONFIG_DIR);
  await fs.ensureDir(IMAGES_DIR);
}

export async function readConfig() {
  await ensureConfigDir();
  if (!(await fs.pathExists(CONFIG_FILE))) {
    return { pages: [] };
  }
  try {
    return await fs.readJson(CONFIG_FILE);
  } catch {
    logger.warn('File config.json bị hỏng. Tạo lại file mới.');
    return { pages: [] };
  }
}

export async function writeConfig(config) {
  await ensureConfigDir();
  await fs.writeJson(CONFIG_FILE, config, { spaces: 2 });
}

export async function getPages() {
  const config = await readConfig();
  return config.pages || [];
}

export async function addPage(page) {
  const config = await readConfig();
  config.pages.push(page);
  await writeConfig(config);
}

export async function updatePage(pageId, updates) {
  const config = await readConfig();
  const idx = config.pages.findIndex((p) => p.id === pageId);
  if (idx !== -1) {
    config.pages[idx] = { ...config.pages[idx], ...updates };
    await writeConfig(config);
  }
}

export { IMAGES_DIR };
