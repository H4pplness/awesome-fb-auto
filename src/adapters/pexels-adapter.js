import axios from 'axios';
import fs from 'fs-extra';
import { ImageAdapter } from './image-adapter.js';

export class PexelsAdapter extends ImageAdapter {
  constructor() {
    super();
    this.apiKey = process.env.PEXELS_API_KEY;
    this.baseUrl = 'https://api.pexels.com/v1';
  }

  async search(query, count = 5) {
    if (!this.apiKey) {
      throw new Error('Thiếu PEXELS_API_KEY. Vui lòng set biến môi trường.');
    }
    const res = await axios.get(`${this.baseUrl}/search`, {
      params: { query, per_page: count },
      headers: { Authorization: this.apiKey },
    });
    return res.data.photos.map((photo) => ({
      id: String(photo.id),
      description: photo.alt || '(Không có mô tả)',
      thumbUrl: photo.src.tiny,
      downloadUrl: photo.src.original,
      author: photo.photographer,
      sourceName: 'Pexels',
    }));
  }

  async download(url, destPath) {
    const res = await axios.get(url, {
      responseType: 'stream',
      headers: { Authorization: this.apiKey },
    });
    await fs.ensureFile(destPath);
    const writer = fs.createWriteStream(destPath);
    res.data.pipe(writer);
    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(destPath));
      writer.on('error', reject);
    });
  }
}
