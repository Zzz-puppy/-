export class HttpUtil {
  constructor() {
    const app = getApp();
    this.baseUrl = (app && app.globalData && app.globalData.baseUrl) || 'http://127.0.0.1:8080';
  }

  buildUrl(url) {
    if (/^https?:\/\//.test(url)) return url;
    const baseUrl = this.baseUrl.replace(/\/$/, '');
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${path}`;
  }

  async request(method, url, data = {}, options = {}) {
    const authToken = options.useAdminToken
      ? wx.getStorageSync('adminToken')
      : wx.getStorageSync('token');
    const header = {
      'Content-Type': 'application/json',
      ...(options.header || {})
    };

    if (authToken && !options.skipAuth) {
      header.Authorization = `Bearer ${authToken}`;
    }

    return new Promise((resolve, reject) => {
      wx.request({
        url: this.buildUrl(url),
        method,
        data,
        header,
        timeout: options.timeout || 15000,
        success: (res) => {
          const body = res.data || {};
          if (res.statusCode === 401 || body.code === 401) {
            wx.removeStorageSync('token');
            wx.removeStorageSync('userId');
            reject(new Error(body.message || '登录已过期，请重新登录'));
            return;
          }
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(body.message || `请求失败：${res.statusCode}`));
            return;
          }
          if (Object.prototype.hasOwnProperty.call(body, 'code')) {
            if (body.code === 200) {
              resolve(body.data);
            } else {
              reject(new Error(body.message || `接口错误：${body.code}`));
            }
            return;
          }
          resolve(body);
        },
        fail: (error) => {
          const msg = (error && error.errMsg) || '网络请求失败';
          reject(new Error(`${msg}（${this.buildUrl(url)}）`));
        }
      });
    });
  }

  async get(url, data = {}, options = {}) {
    return this.request('GET', url, data, options);
  }

  async post(url, data = {}, options = {}) {
    return this.request('POST', url, data, options);
  }

  async put(url, data = {}, options = {}) {
    return this.request('PUT', url, data, options);
  }

  async delete(url, data = {}, options = {}) {
    return this.request('DELETE', url, data, options);
  }
}