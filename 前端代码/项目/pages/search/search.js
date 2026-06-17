import { ProductController } from '../../controllers/product-controller.js';

Page({
  data: {
    keyword: '',
    categoryId: 0,
    sortBy: '',
    focus: false,
    goodsList: [],
    loading: false
  },

  onLoad(options) {
    this.setData({
      categoryId: Number(options.categoryId || 0),
      focus: options.focus === '1'
    });
    this.loadGoods();
  },

  onInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch() {
    this.loadGoods();
  },

  onSortChange(e) {
    const sortBy = e.currentTarget.dataset.sort;
    this.setData({ sortBy });
    this.loadGoods();
  },

  async loadGoods() {
    this.setData({ loading: true });
    const productController = new ProductController();
    try {
      const goodsList = await productController.searchProducts(this.data.keyword, this.data.categoryId, this.data.sortBy);
      this.setData({ goodsList });
    } catch (error) {
      console.error('搜索商品失败:', error);
      wx.showToast({ title: '搜索失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  clearKeyword() {
    this.setData({ keyword: '' });
    this.loadGoods();
  },

  goDetail(e) {
    if (!wx.getStorageSync('token')) {
      getApp().globalData.needLogin = true;
      wx.switchTab({ url: '/pages/profile/profile' });
      return;
    }
    const goodsId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${goodsId}`
    });
  },

  onPullDownRefresh() {
    this.loadGoods().finally(() => wx.stopPullDownRefresh());
  }
});