import { FavoriteController } from '../../controllers/favorite-controller.js';

Page({
  data: {
    favorites: [],
    loading: true
  },

  onShow() {
    this.loadFavorites();
  },

  onPullDownRefresh() {
    this.loadFavorites().then(() => wx.stopPullDownRefresh());
  },

  async loadFavorites() {
    this.setData({ loading: true });
    const favoriteController = new FavoriteController();
    try {
      const favorites = await favoriteController.getMyFavorites();
      this.setData({
        favorites: favorites || [],
        loading: false
      });
    } catch (error) {
      console.error('加载收藏列表失败:', error);
      this.setData({ loading: false });
    }
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },

  async removeFavorite(e) {
    const itemId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '取消收藏',
      content: '确定取消收藏该商品吗？',
      success: async (res) => {
        if (res.confirm) {
          const favoriteController = new FavoriteController();
          try {
            await favoriteController.removeFavorite(itemId);
            wx.showToast({ title: '已取消收藏', icon: 'success' });
            this.loadFavorites();
          } catch (error) {
            wx.showToast({ title: error.message || '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});