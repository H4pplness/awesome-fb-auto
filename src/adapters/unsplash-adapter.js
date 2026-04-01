import axios from 'axios';
import fs from 'fs-extra';
import { ImageAdapter } from './image-adapter.js';

export class UnsplashAdapter extends ImageAdapter {
  constructor() {
    super();
    this.accessKey = process.env.UNSPLASH_ACCESS_KEY;
    this.baseUrl = 'https://api.unsplash.com';
  }

  async search(query, count = 5) {
    if (!this.accessKey) {
      throw new Error('Thiếu UNSPLASH_ACCESS_KEY. Vui lòng set biến môi trường.');
    }
    const res = await axios.get(`${this.baseUrl}/search/photos`, {
      params: { query, per_page: count },
      headers: { Authorization: `Client-ID ${this.accessKey}` },
    });
    return res.data.results.map((photo) => ({
      id: photo.id,
      description: photo.description || photo.alt_description || '(Không có mô tả)',
      thumbUrl: photo.urls.thumb,
      downloadUrl: photo.urls.full,
      author: photo.user.name,
      sourceName: 'Unsplash',
    }));
  }

  async download(url, destPath) {
    const res = await axios.get(url, { responseType: 'stream' });
    await fs.ensureFile(destPath);
    const writer = fs.createWriteStream(destPath);
    res.data.pipe(writer);
    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(destPath));
      writer.on('error', reject);
    });
  }
}
