import { HttpUtil } from '../utils/http-util.js';

export class FavoriteModel {
  constructor() {
    this.httpUtil = new HttpUtil();
  }

  async getMyFavorites() {
    try {
      const data = await this.httpUtil.get('/api/favorite/my');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('获取收藏列表失败:', error.message);
      return [];
    }
  }

  async addFavorite(itemId) {
    return this.httpUtil.post(`/api/favorite/${itemId}`);
  }

  async removeFavorite(itemId) {
    return this.httpUtil.delete(`/api/favorite/${itemId}`);
  }

  async checkFavorited(itemId) {
    try {
      const data = await this.httpUtil.get(`/api/favorite/check/${itemId}`);
      return !!(data && data.favorited);
    } catch (error) {
      return false;
    }
  }
}