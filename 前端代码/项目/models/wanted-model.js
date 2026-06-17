import { HttpUtil } from '../utils/http-util.js';

export class WantedModel {
  constructor() {
    this.httpUtil = new HttpUtil();
  }

  async getList(page = 1, size = 20) {
    try {
      const data = await this.httpUtil.get(`/api/wanted/list?page=${page}&size=${size}`, {}, { skipAuth: true });
      return data;
    } catch (error) {
      console.error('求购列表加载失败:', error.message);
      return { list: [], total: 0 };
    }
  }

  async getMyList() {
    try {
      const data = await this.httpUtil.get('/api/wanted/my');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('我的求购加载失败:', error.message);
      return [];
    }
  }

  async publish(params) {
    return this.httpUtil.post('/api/wanted', {
      title: String(params.title || '').trim(),
      description: String(params.description || '').trim(),
      categoryId: Number(params.categoryId) || 6,
      budget: params.budget ? Number(params.budget) : null
    });
  }

  async update(id, params) {
    return this.httpUtil.put(`/api/wanted/${id}`, {
      title: String(params.title || '').trim(),
      description: String(params.description || '').trim(),
      categoryId: Number(params.categoryId) || 6,
      budget: params.budget ? Number(params.budget) : null
    });
  }

  async cancel(id) {
    return this.httpUtil.delete(`/api/wanted/${id}`);
  }

  async fulfill(id) {
    return this.httpUtil.put('/api/wanted/' + id + '/fulfill', {});
  }
}