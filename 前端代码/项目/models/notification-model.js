import { HttpUtil } from '../utils/http-util.js';

export class NotificationModel {
  constructor() {
    this.httpUtil = new HttpUtil();
  }

  async getList() {
    try {
      const data = await this.httpUtil.get('/api/notification/list');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('获取通知列表失败:', error.message);
      return [];
    }
  }

  async getUnreadCount() {
    try {
      const data = await this.httpUtil.get('/api/notification/unread');
      return (data && data.count) || 0;
    } catch (error) {
      return 0;
    }
  }

  async markAsRead(id) {
    return this.httpUtil.put(`/api/notification/${id}/read`, {});
  }

  async markAllAsRead() {
    return this.httpUtil.put('/api/notification/read-all', {});
  }
}