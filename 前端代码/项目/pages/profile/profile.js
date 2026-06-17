import { UserController } from '../../controllers/user-controller.js';

Page({
  data: {
    userInfo: {},
    userInitial: '我',
    isLoggedIn: false,
    certificationStatus: '',
    stats: {
      publishCount: 0,
      orderCount: 0
    },
    orderBadge: {
      all: 0,
      pending: 0,
      review: 0
    }
  },

  onLoad: function () {
    this.loadUserInfo();
    this.loadStats();
    this.loadCertificationStatus();
  },

  onShow: function () {
    this.loadUserInfo();
    this.loadStats();
    this.loadCertificationStatus();

    // 从发布/消息页跳过来的，自动弹出登录
    const app = getApp();
    if (app.globalData.needLogin) {
      app.globalData.needLogin = false;
      this.login();
    }
  },

  async loadUserInfo() {
    const userController = new UserController();
    try {
      const userInfo = await userController.getProfile();
      const token = wx.getStorageSync('token');
      this.setData({
        userInfo: userInfo,
        isLoggedIn: !!token,
        userInitial: (userInfo.nickname || '我').slice(0, 1)
      });
    } catch (error) {
      const cached = wx.getStorageSync('userInfo');
      const token = wx.getStorageSync('token');
      if (token) {
        wx.removeStorageSync('token');
        wx.removeStorageSync('userId');
      }
      this.setData({
        userInfo: cached || {},
        isLoggedIn: false,
        userInitial: ((cached && cached.nickname) || '我').slice(0, 1)
      });
    }
  },

  async loadCertificationStatus() {
    if (!wx.getStorageSync('token')) return;
    if (this.data.userInfo && this.data.userInfo.isCertified) return;

    try {
      const userController = new UserController();
      const cert = await userController.getCertificationStatus();
      if (cert && cert.status) {
        this.setData({ certificationStatus: cert.status });
      }
    } catch (error) {
      console.error('加载认证状态失败:', error);
    }
  },

  async loadStats() {
    if (!wx.getStorageSync('token')) {
      this.setData({
        stats: { publishCount: 0, orderCount: 0 },
        orderBadge: { all: 0, pending: 0, review: 0 }
      });
      return;
    }

    const userController = new UserController();
    try {
      const stats = await userController.getUserStats();
      this.setData({ stats: stats });
    } catch (error) {
      console.error('加载用户统计失败:', error);
    }
  },

  /**
   * 一键登录
   */
  login: function () {
    wx.showLoading({ title: '登录中...' });
    const userController = new UserController();
    userController.login()
      .then(() => {
        wx.hideLoading();
        wx.showToast({ title: '登录成功', icon: 'success' });
        this.loadUserInfo();
        this.loadStats();
        this.loadCertificationStatus();
        // 登录后回到来源页面
        const app = getApp();
        const redirectUrl = app.globalData.redirectAfterLogin;
        app.globalData.redirectAfterLogin = null;
        if (redirectUrl) {
          wx.switchTab({ url: redirectUrl });
        }
      })
      .catch((error) => {
        wx.hideLoading();
        wx.showToast({ title: error.message || '登录失败', icon: 'none' });
        console.error('登录失败:', error);
      });
  },

  goEditProfile: function () {
    if (!this.data.isLoggedIn) {
      this.login();
      return;
    }

    wx.showModal({
      title: '编辑资料',
      content: '',
      editable: true,
      placeholderText: this.data.userInfo.nickname || '请输入新的昵称',
      success: (res) => {
        if (!res.confirm) return;
        const nickname = (res.content || '').trim();
        if (!nickname) {
          wx.showToast({ title: '昵称不能为空', icon: 'none' });
          return;
        }
        wx.showLoading({ title: '保存中...' });
        const userController = new UserController();
        userController.updateProfile({ nickname })
          .then(() => {
            wx.hideLoading();
            wx.showToast({ title: '保存成功', icon: 'success' });
            this.loadUserInfo();
          })
          .catch((error) => {
            wx.hideLoading();
            wx.showToast({ title: error.message || '保存失败', icon: 'none' });
          });
      }
    });
  },

  goMyPublish: function () {
    if (!this.data.isLoggedIn) {
      this.login();
      return;
    }
    wx.navigateTo({ url: '/pages/my-publish/my-publish' });
  },

  goOrders: function (e) {
    if (!this.data.isLoggedIn) {
      this.login();
      return;
    }
    const status = (e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.status) || 'all';
    wx.navigateTo({ url: `/pages/orders/orders?status=${status}` });
  },

  /**
   * 管理系统入口：输入密码登录管理系统
   */
  goAdmin: function () {
    const userController = new UserController();
    // 先检查管理系统是否被锁定
    wx.showLoading({ title: '检查中...' });
    userController.getAdminStatus()
      .then((status) => {
        wx.hideLoading();
        if (status && status.locked) {
          wx.showToast({ title: '管理系统入口已被锁定', icon: 'none', duration: 2000 });
          return;
        }
        // 未锁定，弹出密码输入框
        wx.showModal({
          title: '管理系统登录',
          content: '',
          editable: true,
          placeholderText: '请输入管理系统密码',
          success: (res) => {
            if (!res.confirm) return;
            const password = (res.content || '').trim();
            if (!password) {
              wx.showToast({ title: '密码不能为空', icon: 'none' });
              return;
            }
            wx.showLoading({ title: '验证中...' });
            userController.adminLogin(password)
              .then((result) => {
                wx.hideLoading();
                // 管理系统使用独立 token，不影响普通用户登录状态
                wx.setStorageSync('adminToken', result.token);
                wx.showToast({ title: '管理系统登录成功', icon: 'success', duration: 1500 });
                setTimeout(() => {
                  wx.navigateTo({ url: '/pages/admin/admin' });
                }, 1500);
              })
              .catch((error) => {
                wx.hideLoading();
                const msg = error.message || '密码错误';
                wx.showToast({ title: msg, icon: 'none', duration: 2000 });
              });
          }
        });
      })
      .catch(() => {
        wx.hideLoading();
        // 查询失败时降级为直接弹出密码框
        wx.showModal({
          title: '管理系统登录',
          content: '',
          editable: true,
          placeholderText: '请输入管理系统密码',
          success: (res) => {
            if (!res.confirm) return;
            const password = (res.content || '').trim();
            if (!password) {
              wx.showToast({ title: '密码不能为空', icon: 'none' });
              return;
            }
            wx.showLoading({ title: '验证中...' });
            userController.adminLogin(password)
              .then((result) => {
                wx.hideLoading();
                // 管理系统使用独立 token，不影响普通用户登录状态
                wx.setStorageSync('adminToken', result.token);
                wx.showToast({ title: '管理系统登录成功', icon: 'success', duration: 1500 });
                setTimeout(() => {
                  wx.navigateTo({ url: '/pages/admin/admin' });
                }, 1500);
              })
              .catch((error) => {
                wx.hideLoading();
                wx.showToast({ title: error.message || '密码错误', icon: 'none', duration: 2000 });
              });
          }
        });
      });
  },

  goFavorites: function () {
    if (!this.data.isLoggedIn) {
      this.login();
      return;
    }
    wx.navigateTo({ url: '/pages/my-favorites/my-favorites' });
  },

  goMyWanted: function () {
    wx.navigateTo({ url: '/pages/wanted/wanted?tab=my' });
  },

  certify: function () {
    if (!this.data.isLoggedIn) {
      this.login();
      return;
    }

    if (this.data.userInfo.isCertified) {
      wx.showToast({ title: '您已认证，无需重复认证', icon: 'none' });
      return;
    }

    if (this.data.certificationStatus === 'pending') {
      wx.showToast({ title: '您的认证申请正在审核中，请耐心等待', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '校园认证' + (this.data.certificationStatus === 'rejected' ? '（重新申请）' : ''),
      content: '',
      editable: true,
      placeholderText: '请输入您的学号',
      success: (res) => {
        if (res.confirm) {
          const studentId = (res.content || '').trim();
          if (!studentId) {
            wx.showToast({ title: '学号不能为空', icon: 'none' });
            return;
          }
          wx.showModal({
            title: '校园认证',
            content: '',
            editable: true,
            placeholderText: '请输入校园邮箱（可选）',
            success: (res2) => {
              if (res2.confirm) {
                const email = (res2.content || '').trim();
                this.submitCertify(studentId, email);
              }
            }
          });
        }
      }
    });
  },

  submitCertify: function (studentId, email) {
    wx.showLoading({ title: '提交中...' });
    const userController = new UserController();
    userController.certify(studentId, email)
      .then(() => {
        wx.hideLoading();
        wx.showToast({ title: '认证申请已提交，等待系统审核', icon: 'success' });
        this.loadCertificationStatus();
      })
      .catch((error) => {
        wx.hideLoading();
        wx.showToast({ title: error.message || '提交失败', icon: 'none' });
      });
  },

  clearLogin: function () {
    wx.removeStorageSync('token');
    wx.removeStorageSync('userId');
    wx.removeStorageSync('userInfo');
    this.setData({
      userInfo: {},
      userInitial: '我',
      isLoggedIn: false,
      certificationStatus: '',
      stats: { publishCount: 0, orderCount: 0 },
      orderBadge: { all: 0, pending: 0, review: 0 }
    });
    wx.showToast({ title: '已清除登录', icon: 'success' });
  }
});