import fs from 'fs-extra';
import { randomUUID } from 'crypto';
import { CONFIG_DIR, CONFIG_FILE, DRAFTS_FILE, IMAGES_DIR } from '../utils/config.js';
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

// ── Drafts ────────────────────────────────────────────────────────────────────

async function readDrafts() {
  await ensureConfigDir();
  if (!(await fs.pathExists(DRAFTS_FILE))) return { drafts: [] };
  try {
    return await fs.readJson(DRAFTS_FILE);
  } catch {
    logger.warn('File drafts.json bị hỏng. Tạo lại file mới.');
    return { drafts: [] };
  }
}

async function writeDrafts(data) {
  await ensureConfigDir();
  await fs.writeJson(DRAFTS_FILE, data, { spaces: 2 });
}

export async function getDrafts() {
  const data = await readDrafts();
  return data.drafts || [];
}

export async function saveDraft({ title, content, imagePath }) {
  const data = await readDrafts();
  const draft = {
    id: randomUUID(),
    title,
    content,
    imagePath: imagePath || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  data.drafts.push(draft);
  await writeDrafts(data);
  return draft;
}

export async function updateDraft(id, updates) {
  const data = await readDrafts();
  const idx = data.drafts.findIndex((d) => d.id === id);
  if (idx === -1) throw new Error(`Không tìm thấy draft id="${id}"`);
  data.drafts[idx] = { ...data.drafts[idx], ...updates, updatedAt: new Date().toISOString() };
  await writeDrafts(data);
  return data.drafts[idx];
}

export async function deleteDraft(id) {
  const data = await readDrafts();
  const before = data.drafts.length;
  data.drafts = data.drafts.filter((d) => d.id !== id);
  if (data.drafts.length === before) throw new Error(`Không tìm thấy draft id="${id}"`);
  await writeDrafts(data);
}
