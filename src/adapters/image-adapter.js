/**
 * @typedef {Object} ImageResult
 * @property {string} id
 * @property {string} description
 * @property {string} thumbUrl
 * @property {string} downloadUrl
 * @property {string} author
 * @property {string} sourceName
 */

export class ImageAdapter {
  /**
   * @param {string} query
   * @param {number} count
   * @returns {Promise<ImageResult[]>}
   */
  async search(query, count) {
    throw new Error('search() phải được implement bởi adapter con');
  }

  /**
   * @param {string} url
   * @param {string} destPath
   * @returns {Promise<string>}
   */
  async download(url, destPath) {
    throw new Error('download() phải được implement bởi adapter con');
  }
}
