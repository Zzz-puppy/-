import { HttpUtil } from '../utils/http-util.js';

export class SystemModel {
  constructor() {
    this.httpUtil = new HttpUtil();
  }

  async getConfig() {
    const app = getApp();
    return {
      baseUrl: (app && app.globalData && app.globalData.baseUrl) || wx.getStorageSync('baseUrl') || 'http://127.0.0.1:8080',
      campus: wx.getStorageSync('campus') || (app && app.globalData && app.globalData.campus) || '默认校区'
    };
  }

  async getCategories() {
    return this.getDefaultCategories();
  }

  async getLocations() {
    return ['教学楼', '图书馆', '宿舍区', '食堂', '体育馆', '校门口'];
  }

  getDefaultCategories() {
    return [
      { id: 1, name: '数码产品' },
      { id: 2, name: '图书教材' },
      { id: 3, name: '生活用品' },
      { id: 4, name: '运动器材' },
      { id: 5, name: '服装服饰' },
      { id: 6, name: '其他' }
    ];
  }
}