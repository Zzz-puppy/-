import { AdminController } from '../../controllers/admin-controller.js';

Page({
  data: {
    activeTab: 'cert',
    pendingCerts: [],
    pendingCertCount: 0,
    users: [],
    items: [],
    reports: [],
    pendingReportCount: 0
  },

  adminController: null,

  onLoad: function () {
    this.adminController = new AdminController();
    this.loadTabData();
  },

  onUnload: function () {
    // 离开管理系统时清除管理系统 token
    wx.removeStorageSync('adminToken');
  },

  onShow: function () {
    if (this.adminController) {
      this.loadTabData();
    }
  },

  switchTab: function (e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    this.loadTabData();
  },

  async loadTabData() {
    const tab = this.data.activeTab;
    if (tab === 'cert') {
      await this.loadPendingCerts();
    } else if (tab === 'users') {
      await this.loadUsers();
    } else if (tab === 'items') {
      await this.loadItems();
    } else if (tab === 'reports') {
      await this.loadReports();
    }
  },

  async loadReports() {
    try {
      const reports = await this.adminController.getAllReports();
      const pendingCount = (reports || []).filter(r => r.status === 'pending').length;
      this.setData({
        reports: reports || [],
        pendingReportCount: pendingCount
      });
    } catch (error) {
      console.error('加载举报列表失败:', error);
      wx.showToast({ title: '加载举报列表失败', icon: 'none' });
    }
  },

  async approveReport(e) {
    const reportId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认批准',
      content: '批准后将下架该商品，确定？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          try {
            await this.adminController.approveReport(reportId);
            wx.hideLoading();
            wx.showToast({ title: '已处理', icon: 'success' });
            this.loadReports();
            this.loadItems();
          } catch (error) {
            wx.hideLoading();
            wx.showToast({ title: error.message || '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  async rejectReport(e) {
    const reportId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '驳回举报',
      content: '请输入驳回理由',
      editable: true,
      placeholderText: '请输入驳回原因',
      success: async (res) => {
        if (res.confirm) {
          const reason = (res.content || '').trim() || '经审核不属于违规内容';
          wx.showLoading({ title: '处理中...' });
          try {
            await this.adminController.rejectReport(reportId, reason);
            wx.hideLoading();
            wx.showToast({ title: '已驳回', icon: 'success' });
            this.loadReports();
          } catch (error) {
            wx.hideLoading();
            wx.showToast({ title: error.message || '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  async loadPendingCerts() {
    try {
      const certs = await this.adminController.getPendingCertifications();
      this.setData({
        pendingCerts: certs || [],
        pendingCertCount: (certs || []).length
      });
    } catch (error) {
      console.error('加载认证申请失败:', error);
      wx.showToast({ title: '加载认证申请失败', icon: 'none' });
    }
  },

  async loadUsers() {
    try {
      const users = await this.adminController.getAllUsers();
      this.setData({ users: users || [] });
    } catch (error) {
      console.error('加载用户列表失败:', error);
      wx.showToast({ title: '加载用户列表失败', icon: 'none' });
    }
  },

  async loadItems() {
    try {
      const items = await this.adminController.getAllItems();
      this.setData({ items: items || [] });
    } catch (error) {
      console.error('加载商品列表失败:', error);
      wx.showToast({ title: '加载商品列表失败', icon: 'none' });
    }
  },

  async approveCert(e) {
    const certId = e.currentTarget.dataset.id;
    wx.showLoading({ title: '处理中...' });
    try {
      await this.adminController.approveCertification(certId);
      wx.hideLoading();
      wx.showToast({ title: '已批准', icon: 'success' });
      this.loadPendingCerts();
    } catch (error) {
      wx.hideLoading();
      wx.showToast({ title: error.message || '操作失败', icon: 'none' });
    }
  },

  async rejectCert(e) {
    const certId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '拒绝认证',
      content: '请输入拒绝理由',
      editable: true,
      placeholderText: '请输入拒绝原因',
      success: async (res) => {
        if (res.confirm) {
          const reason = (res.content || '').trim() || '认证信息不符合要求';
          wx.showLoading({ title: '处理中...' });
          try {
            await this.adminController.rejectCertification(certId, reason);
            wx.hideLoading();
            wx.showToast({ title: '已拒绝', icon: 'success' });
            this.loadPendingCerts();
          } catch (error) {
            wx.hideLoading();
            wx.showToast({ title: error.message || '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  async adjustCredit(e) {
    const userId = e.currentTarget.dataset.id;
    const delta = parseInt(e.currentTarget.dataset.delta);
    wx.showLoading({ title: '处理中...' });
    try {
      await this.adminController.updateCreditScore(userId, delta);
      wx.hideLoading();
      wx.showToast({ title: delta > 0 ? '信用分已增加' : '信用分已减少', icon: 'success' });
      this.loadUsers();
    } catch (error) {
      wx.hideLoading();
      wx.showToast({ title: error.message || '操作失败', icon: 'none' });
    }
  },

  async banItem(e) {
    const itemId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认下架',
      content: '确定要下架该商品吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          try {
            await this.adminController.banItem(itemId);
            wx.hideLoading();
            wx.showToast({ title: '已下架', icon: 'success' });
            this.loadItems();
          } catch (error) {
            wx.hideLoading();
            wx.showToast({ title: error.message || '操作失败', icon: 'none' });
          }
        }
      }
    });
  }
});