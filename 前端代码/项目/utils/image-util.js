export class ImageUtil {
  static async compress(filePath, quality = 0.8) {
    return new Promise((resolve) => {
      wx.compressImage({
        src: filePath,
        quality: Math.round(quality * 100),
        success: (res) => {
          resolve(res.tempFilePath);
        },
        fail: () => {
          resolve(filePath);
        }
      });
    });
  }

  static getImageHostConfig() {
    const app = getApp();
    return (app && app.globalData && app.globalData.imageHost) || {};
  }

  static getValueByPath(source, path) {
    if (!path) return '';
    return String(path).split('.').reduce((value, key) => {
      if (value && Object.prototype.hasOwnProperty.call(value, key)) {
        return value[key];
      }
      return '';
    }, source);
  }

  static parseUploadResponse(raw, responseUrlPath) {
    let body = raw;
    if (typeof raw === 'string') {
      try {
        body = JSON.parse(raw || '{}');
      } catch (error) {
        body = {};
      }
    }

    return this.getValueByPath(body, responseUrlPath)
      || this.getValueByPath(body, 'data.url')
      || this.getValueByPath(body, 'data.imageUrl')
      || this.getValueByPath(body, 'url')
      || this.getValueByPath(body, 'imageUrl');
  }

  static async upload(filePath) {
    const config = this.getImageHostConfig();
    if (!config.uploadUrl) {
      throw new Error('请先配置图床上传地址');
    }

    const token = wx.getStorageSync('token');
    const headers = { ...(config.header || {}) };
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: config.uploadUrl,
        filePath,
        name: config.fileField || 'file',
        formData: config.formData || {},
        header: headers,
        success: (res) => {
          const imageUrl = this.parseUploadResponse(res.data, config.responseUrlPath || 'url');
          if (imageUrl) {
            resolve(imageUrl);
          } else {
            reject(new Error('图床响应中未找到图片链接'));
          }
        },
        fail: (error) => {
          reject(new Error((error && error.errMsg) || '图床上传失败'));
        }
      });
    });
  }

  static async uploadMultiple(filePaths) {
    const urls = [];
    for (const filePath of filePaths) {
      const url = await this.upload(filePath);
      urls.push(url);
    }
    return urls;
  }
}