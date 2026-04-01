import { UnsplashAdapter } from './unsplash-adapter.js';
import { PexelsAdapter } from './pexels-adapter.js';

const registry = {
  unsplash: () => new UnsplashAdapter(),
  pexels: () => new PexelsAdapter(),
};

export function getAdapter(source) {
  const factory = registry[source.toLowerCase()];
  if (!factory) {
    throw new Error(`Nguồn ảnh "${source}" không được hỗ trợ. Các nguồn hợp lệ: ${Object.keys(registry).join(', ')}`);
  }
  return factory();
}

export function listSources() {
  return Object.keys(registry);
}
