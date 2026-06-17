import { NotificationModel } from '../models/notification-model.js';

export class NotificationController {
  constructor() {
    this.notificationModel = new NotificationModel();
  }

  async getList() {
    try {
      return await this.notificationModel.getList();
    } catch (error) {
      throw error;
    }
  }

  async getUnreadCount() {
    try {
      return await this.notificationModel.getUnreadCount();
    } catch (error) {
      return 0;
    }
  }

  async markAsRead(id) {
    return this.notificationModel.markAsRead(id);
  }

  async markAllAsRead() {
    return this.notificationModel.markAllAsRead();
  }
}