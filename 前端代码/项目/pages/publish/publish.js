import { ProductController } from '../../controllers/product-controller.js';
import { UserController } from '../../controllers/user-controller.js';
import { ImageUtil } from '../../utils/image-util.js';
import { WxValidate } from '../../utils/validate.js';

Page({
  data: {
    images: [],
    formData: {
      title: '',
      categoryId: '',
      categoryName: '',
      condition: '',
      price: '',
      originalPrice: '',
      location: '',
      tradeMethods: [],
      hasSelfTrade: false,
      hasExchangeTrade: false,
      description: ''
    },
    categories: [
      { id: 1, name: '数码产品' },
      { id: 2, name: '图书教材' },
      { id: 3, name: '生活用品' },
      { id: 4, name: '运动器材' },
      { id: 5, name: '服装服饰' },
      { id: 6, name: '其他' }
    ],
    conditions: ['全新', '95新', '9成新', '85新', '8成新', '7成新', '7成新以下'],
    locations: ['教学楼', '图书馆', '宿舍区', '食堂', '体育馆', '校门口']
  },

  onLoad: function () {
    this.initValidator();
    this.resetForm();
    this.checkLogin();
  },

  onShow: function () {
    this.resetForm();
    // 移除 this.checkLogin() - 图片选择器关闭会触发 onShow，不应强制跳转登录
  },

  checkLogin: function () {
    if (wx.getStorageSync('token')) return;

    const app = getApp();
    app.globalData.needLogin = true;
    app.globalData.redirectAfterLogin = '/pages/publish/publish';
    wx.switchTab({ url: '/pages/profile/profile' });
  },

  resetForm: function () {
    this.setData({
      images: [],
      formData: {
        title: '',
        categoryId: '',
        categoryName: '',
        condition: '',
        price: '',
        originalPrice: '',
        location: '',
        tradeMethods: [],
        hasSelfTrade: false,
        hasExchangeTrade: false,
        description: ''
      }
    });
  },

  initValidator: function () {
    this.validator = new WxValidate({
      title: {
        required: true,
        minlength: 2,
        maxlength: 50
      },
      categoryId: {
        required: true
      },
      condition: {
        required: true
      },
      price: {
        required: true,
        number: true
      },
      location: {
        required: true
      },
      description: {
        required: true,
        minlength: 10
      }
    }, {
      title: {
        required: '请输入商品标题',
        minlength: '标题至少2个字符',
        maxlength: '标题最多50个字符'
      },
      categoryId: {
        required: '请选择商品分类'
      },
      condition: {
        required: '请选择商品成色'
      },
      price: {
        required: '请输入商品价格',
        number: '价格必须是数字'
      },
      location: {
        required: '请选择交易地点'
      },
      description: {
        required: '请输入商品描述',
        minlength: '描述至少10个字符'
      }
    });
  },

  onInputChange: function (e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`formData.${field}`]: e.detail.value
    });
  },

  onCategoryChange: function (e) {
    const index = e.detail.value;
    const category = this.data.categories[index];
    this.setData({
      'formData.categoryId': category.id,
      'formData.categoryName': category.name
    });
  },

  onConditionChange: function (e) {
    const index = e.detail.value;
    this.setData({
      'formData.condition': this.data.conditions[index]
    });
  },

  onLocationChange: function (e) {
    const index = e.detail.value;
    this.setData({
      'formData.location': this.data.locations[index]
    });
  },

  toggleTradeMethod: function (e) {
    const value = e.currentTarget.dataset.value;
    const methods = [...this.data.formData.tradeMethods];
    const index = methods.indexOf(value);
    
    if (index > -1) {
      methods.splice(index, 1);
    } else {
      methods.push(value);
    }
    
    this.setData({
      'formData.tradeMethods': methods,
      'formData.hasSelfTrade': methods.includes('self'),
      'formData.hasExchangeTrade': methods.includes('exchange')
    });
  },

  chooseImage: function () {
    wx.chooseImage({
      count: 9 - this.data.images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFiles = res.tempFiles;
        const compressedImages = [];
        
        for (let i = 0; i < tempFiles.length; i++) {
          const compressed = await ImageUtil.compress(tempFiles[i].path);
          compressedImages.push(compressed);
        }
        
        this.setData({
          images: [...this.data.images, ...compressedImages]
        });
      }
    });
  },

  previewImage: function (e) {
    const index = e.currentTarget.dataset.index;
    wx.previewImage({
      current: this.data.images[index],
      urls: this.data.images
    });
  },

  deleteImage: function (e) {
    const index = e.currentTarget.dataset.index;
    const images = [...this.data.images];
    images.splice(index, 1);
    this.setData({
      images: images
    });
  },

  hasImageHostConfig: function () {
    const config = ImageUtil.getImageHostConfig();
    return !!config.uploadUrl;
  },

  confirmPublishWithoutImage: function () {
    console.warn('商品发布已停止：未配置图床上传地址，无法先上传图片获取 imageUrl。');
    return new Promise((resolve) => {
      wx.showModal({
        title: '图床未配置',
        content: '后端支持不带图片发布。当前图片无法上传到图床，是否继续发布无图商品？',
        confirmText: '继续发布',
        cancelText: '取消',
        success: (res) => {
          resolve(!!res.confirm);
        },
        fail: () => {
          resolve(false);
        }
      });
    });
  },

  publishProduct: function (params, imageUrls = []) {
    const productController = new ProductController();
    return productController.publish({
      ...params,
      imageUrl: imageUrls[0] || '',
      imageUrls
    });
  },

  ensureLogin: function () {
    const token = wx.getStorageSync('token');
    if (token) {
      return Promise.resolve(true);
    }

    wx.showLoading({ title: '登录中...' });
    const userController = new UserController();
    return userController.login()
      .then(() => true)
      .catch((error) => {
        console.error('发布前登录失败:', error);
        throw new Error('请先登录后再发布');
      });
  },

  getPublishErrorMessage: function (error) {
    const message = error && error.message ? error.message : '';
    if (message.includes('用户未登录') || message.includes('登录') || message.includes('401')) {
      return '请先登录后再发布';
    }
    if (message.includes('request:fail') || message.includes('Failed to fetch') || message.includes('网络')) {
      return '后端连接失败';
    }
    if (message.includes('图床')) {
      return message;
    }
    return message || '发布失败';
  },

  submitForm: async function () {
    const params = {
      ...this.data.formData,
      images: this.data.images
    };

    if (!this.validator.checkForm(params)) {
      const error = this.validator.errorList[0];
      wx.showToast({
        title: error.msg,
        icon: 'none'
      });
      return;
    }

    const shouldUploadImages = this.data.images.length && this.hasImageHostConfig();
    if (this.data.images.length && !shouldUploadImages) {
      const confirmed = await this.confirmPublishWithoutImage();
      if (!confirmed) {
        return;
      }
    }

    this.ensureLogin()
      .then(() => {
        wx.showLoading({ title: shouldUploadImages ? '上传图片...' : '发布中...' });
        return shouldUploadImages ? ImageUtil.uploadMultiple(this.data.images) : Promise.resolve([]);
      })
      .then((imageUrls) => {
        if (shouldUploadImages) {
          wx.showLoading({ title: '发布中...' });
        }
        return this.publishProduct(params, imageUrls);
      })
      .then(() => {
        wx.hideLoading();
        wx.showToast({ title: '发布成功', icon: 'success' });
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          });
        }, 1500);
      })
      .catch((error) => {
        wx.hideLoading();
        wx.showToast({
          title: this.getPublishErrorMessage(error),
          icon: 'none'
        });
        console.error('发布失败:', error);
      });
  }
});