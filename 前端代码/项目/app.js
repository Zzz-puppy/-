import { UserController } from './controllers/user-controller.js';
import { SystemController } from './controllers/system-controller.js';

App({
  onLaunch: function () {
    try {
      const sys = wx.getSystemInfoSync();
      if (sys && sys.platform === 'devtools') {
        wx.removeStorageSync('token');
        wx.removeStorageSync('userId');
        wx.removeStorageSync('userInfo');
        wx.removeStorageSync('baseUrl');
        wx.removeStorageSync('campus');
      }
    } catch (e) {}

    const userController = new UserController();
    const systemController = new SystemController();
    
    systemController.init();
    userController.init();
    
    this.checkUpdate();
  },

  onShow: function () {
    try {
      const sys = wx.getSystemInfoSync();
      if (sys && sys.platform === 'devtools') {
        wx.removeStorageSync('token');
        wx.removeStorageSync('userId');
        wx.removeStorageSync('userInfo');
        wx.removeStorageSync('baseUrl');
        wx.removeStorageSync('campus');
      }
    } catch (e) {}

    const userController = new UserController();
    userController.checkSession();
  },

  onHide: function () {
    console.log('App Hide');
  },

  checkUpdate: function () {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(function (res) {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已准备好，是否重启应用？',
              success: function (res) {
                if (res.confirm) {
                  updateManager.applyUpdate();
                }
              }
            });
          });
          updateManager.onUpdateFailed(function () {
            wx.showToast({
              title: '新版本下载失败',
              icon: 'none'
            });
          });
        }
      });
    }
  },

  globalData: {
    userInfo: null,
    sessionKey: null,
    userId: null,
    baseUrl: 'http://127.0.0.1:8080',
    campus: '默认校区',
    redirectAfterLogin: null,
    imageHost: {
      uploadUrl: 'http://127.0.0.1:8080/api/upload',
      fileField: 'file',
      responseUrlPath: 'data',
      formData: {},
      header: {}
    }
  }
});