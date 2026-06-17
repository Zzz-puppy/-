import { ProductController } from '../../controllers/product-controller.js';
import { OrderController } from '../../controllers/order-controller.js';
import { FavoriteController } from '../../controllers/favorite-controller.js';
import { ChatStore } from '../../utils/chat-store.js';

Page({
  data: {
    goods: {},
    seller: {},
    isFavorited: false,
    isOwn: false
  },

  onLoad: function (options) {
    this.loadGoodsDetail(options.id);
  },

  async loadGoodsDetail(goodsId) {
    const productController = new ProductController();
    try {
      const goods = await productController.getDetail(goodsId);
      // 判断是否为当前用户的商品
      const currentUserId = wx.getStorageSync('userId');
      const isOwn = goods.sellerId == currentUserId;
      this.setData({
        goods: goods,
        seller: goods.seller || {},
        isOwn: isOwn
      });
      wx.setNavigationBarTitle({
        title: goods.title
      });

      // 检查是否已收藏
      this.checkFavorite(goodsId);
    } catch (error) {
      console.error('加载商品详情失败:', error);
      wx.showToast({ title: '商品不存在', icon: 'none' });
    }
  },

  async checkFavorite(itemId) {
    const favoriteController = new FavoriteController();
    try {
      const favorited = await favoriteController.checkFavorited(itemId);
      this.setData({ isFavorited: favorited });
    } catch (error) {
      // 静默失败
    }
  },

  async toggleFavorite() {
    const favoriteController = new FavoriteController();
    const itemId = this.data.goods.id;
    try {
      if (this.data.isFavorited) {
        await favoriteController.removeFavorite(itemId);
        this.setData({ isFavorited: false });
        wx.showToast({ title: '已取消收藏', icon: 'none' });
      } else {
        await favoriteController.addFavorite(itemId);
        this.setData({ isFavorited: true });
        wx.showToast({ title: '已收藏', icon: 'success' });
      }
    } catch (error) {
      wx.showToast({ title: error.message || '操作失败', icon: 'none' });
    }
  },

  goReport() {
    if (this.data.isOwn) {
      wx.showToast({ title: '这是您自己的商品', icon: 'none' });
      return;
    }
    wx.navigateTo({
      url: `/pages/report/report?id=${this.data.goods.id}`
    });
  },

  buyNow: function () {
    if (this.data.isOwn) {
      wx.showToast({ title: '这是您自己的商品', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '确认购买',
      content: `确定购买 "${this.data.goods.title}" 吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '创建订单...' });
          const orderController = new OrderController();
          orderController.createOrder({ itemId: this.data.goods.id })
            .then(() => {
              wx.hideLoading();
              wx.showToast({ title: '订单创建成功', icon: 'success' });
              setTimeout(() => {
                wx.navigateTo({
                  url: '/pages/orders/orders?status=all'
                });
              }, 800);
            })
            .catch((error) => {
              wx.hideLoading();
              wx.showToast({ title: error.message || '创建失败', icon: 'none' });
            });
        }
      }
    });
  },

  contactSeller: function () {
    if (this.data.isOwn) {
      wx.showToast({ title: '这是您自己的商品', icon: 'none' });
      return;
    }
    const conversation = ChatStore.createProductConversation(this.data.goods, this.data.seller);
    wx.navigateTo({
      url: `/pages/chat/chat?id=${conversation.id}`
    });
  }
});