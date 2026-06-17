import { ProductController } from '../../controllers/product-controller.js';

Page({
  data: {
    searchKeyword: '',
    currentCategory: 0,
    categories: [
      { id: 0, name: '全部', iconText: '全' },
      { id: 1, name: '数码', iconText: '数' },
      { id: 2, name: '图书', iconText: '书' },
      { id: 3, name: '生活', iconText: '生' },
      { id: 4, name: '运动', iconText: '动' },
      { id: 5, name: '服装', iconText: '衣' },
      { id: 6, name: '其他', iconText: '其' },
      { id: 7, name: '求购', iconText: '求' }
    ],
    goodsList: [],
    newGoodsList: []
  },

  onLoad: function (options) {
    this.loadHotGoods();
    this.loadNewGoods();
  },

  onShow: function () {
    this.loadHotGoods(this.data.currentCategory);
    this.loadNewGoods();
  },

  showSearch: function () {
    wx.navigateTo({
      url: '/pages/search/search?focus=1'
    });
  },

  selectCategory: function (e) {
    const categoryId = Number(e.currentTarget.dataset.id);
    if (categoryId === 7) {
      if (!wx.getStorageSync('token')) {
        getApp().globalData.needLogin = true;
        getApp().globalData.redirectAfterLogin = '/pages/index/index';
        wx.switchTab({ url: '/pages/profile/profile' });
        return;
      }
      wx.navigateTo({ url: '/pages/wanted/wanted' });
      return;
    }
    this.setData({
      currentCategory: categoryId
    });
    this.loadHotGoods(categoryId);
  },

  async loadHotGoods(categoryId = 0) {
    const productController = new ProductController();
    try {
      const goods = await productController.getHotProducts(categoryId);
      this.setData({
        goodsList: goods
      });
    } catch (error) {
      console.error('加载热门商品失败:', error);
    }
  },

  async loadNewGoods() {
    const productController = new ProductController();
    try {
      const goods = await productController.getNewProducts();
      this.setData({
        newGoodsList: goods
      });
    } catch (error) {
      console.error('加载最新商品失败:', error);
    }
  },

  goDetail: function (e) {
    if (!wx.getStorageSync('token')) {
      getApp().globalData.needLogin = true;
      getApp().globalData.redirectAfterLogin = '/pages/index/index';
      wx.switchTab({ url: '/pages/profile/profile' });
      return;
    }
    const goodsId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${goodsId}`
    });
  },

  goMore: function () {
    wx.navigateTo({
      url: `/pages/search/search?categoryId=${this.data.currentCategory}`
    });
  },

  onPullDownRefresh: async function () {
    await Promise.all([
      this.loadHotGoods(this.data.currentCategory),
      this.loadNewGoods()
    ]);
    wx.stopPullDownRefresh();
  }
});