import { ChatStore } from '../../utils/chat-store.js';
import { NotificationController } from '../../controllers/notification-controller.js';

Page({
  data: {
    currentTab: 'chat',
    chatList: [],
    noticeList: [],
    noticeCount: 0
  },

  onShow: function () {
    if (!wx.getStorageSync('token')) {
      const app = getApp();
      app.globalData.needLogin = true;
      app.globalData.redirectAfterLogin = '/pages/message/message';
      wx.switchTab({ url: '/pages/profile/profile' });
      return;
    }
    this.loadChats();
    this.loadNotices();
  },

  switchTab: function (e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab
    });
    if (tab === 'notice') {
      this.markAllNoticesRead();
    }
  },

  loadChats: function () {
    const chatList = ChatStore.getConversations();
    this.setData({
      chatList
    });
  },

  loadNotices: function () {
    const controller = new NotificationController();
    controller.getList().then((list) => {
      this.setData({
        noticeList: list,
        noticeCount: list.filter(n => !n.isRead).length
      });
    });
  },

  markAllNoticesRead: function () {
    const controller = new NotificationController();
    controller.markAllAsRead().then(() => {
      const list = this.data.noticeList.map(n => ({ ...n, isRead: true }));
      this.setData({ noticeList: list, noticeCount: 0 });
    });
  },

  onNoticeTap: function (e) {
    const notice = e.currentTarget.dataset.notice;
    // 标记该条为已读
    const controller = new NotificationController();
    controller.markAsRead(notice.id).then(() => {
      const list = this.data.noticeList.map(n => {
        if (n.id === notice.id) n.isRead = true;
        return n;
      });
      const count = list.filter(n => !n.isRead).length;
      this.setData({ noticeList: list, noticeCount: count });
    });

    // 根据类型跳转
    if (notice.type === 'order' && notice.relatedId) {
      wx.navigateTo({ url: '/pages/orders/orders' });
    } else if (notice.type === 'certification') {
      wx.switchTab({ url: '/pages/profile/profile' });
    }
  },

  goChat: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/chat/chat?id=${id}`
    });
  }
});