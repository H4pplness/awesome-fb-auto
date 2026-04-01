import { homedir } from 'os';
import { join } from 'path';

export const CONFIG_DIR = join(homedir(), '.awesome-fb');
export const CONFIG_FILE = join(CONFIG_DIR, 'config.json');
export const DRAFTS_FILE = join(CONFIG_DIR, 'drafts.json');
export const IMAGES_DIR = join(CONFIG_DIR, 'images');
