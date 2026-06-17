import { ProductController } from '../../controllers/product-controller.js';
import { OrderController } from '../../controllers/order-controller.js';

Page({
  data: {
    currentStatus: 'all',
    publishList: []
  },

  onLoad: function (options) {
    this.loadPublishList();
  },

  switchStatus: function (e) {
    const status = e.currentTarget.dataset.status;
    this.setData({
      currentStatus: status
    });
    this.loadPublishList();
  },

  async loadPublishList() {
    const productController = new ProductController();
    try {
      const list = await productController.getMyPublish(this.data.currentStatus);
      this.setData({
        publishList: list
      });
    } catch (error) {
      console.error('加载发布列表失败:', error);
    }
  },

  goDetail: function (e) {
    const goodsId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${goodsId}`
    });
  },

  deleteGoods: function (e) {
    const goodsId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除商品',
      content: '确定删除该商品吗？',
      success: (res) => {
        if (res.confirm) {
          const productController = new ProductController();
          productController.offSale(goodsId)
            .then(() => {
              wx.showToast({ title: '已下架', icon: 'success' });
              this.loadPublishList();
            })
            .catch(() => {
              wx.showToast({ title: '删除失败', icon: 'none' });
            });
        }
      }
    });
  },

  offSale: function (e) {
    const goodsId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '下架商品',
      content: '确定下架该商品吗？',
      success: (res) => {
        if (res.confirm) {
          const productController = new ProductController();
          productController.offSale(goodsId)
            .then(() => {
              wx.showToast({ title: '已下架', icon: 'success' });
              this.loadPublishList();
            })
            .catch(() => {
              wx.showToast({ title: '操作失败', icon: 'none' });
            });
        }
      }
    });
  },

  markSold: function (e) {
    const goodsId = e.currentTarget.dataset.id;
    const productController = new ProductController();
    
    // 获取该商品的待确认订单
    productController.getPendingOrdersByItemId(goodsId)
        .then((orders) => {
            if (!orders || orders.length === 0) {
                // 无待确认订单，直接标记售出（不下架）
                return productController.markSold(goodsId).then(() => {
                    wx.showToast({ title: '已标记售出', icon: 'success' });
                    this.loadPublishList();
                });
            }
            
            if (orders.length === 1) {
                // 只有一个待确认订单，直接确认
                const orderId = orders[0].id;
                const orderController = new OrderController();
                return orderController.completeSale(orderId).then(() => {
                    wx.showToast({ title: '售出成功', icon: 'success' });
                    this.loadPublishList();
                });
            }
            
            // 多个待确认订单，弹出选择
            wx.showActionSheet({
                itemList: orders.map((o) => `选择订单 #${o.id} (买家ID: ${o.buyerId})`),
                success: (res) => {
                    const orderId = orders[res.tapIndex].id;
                    const orderController = new OrderController();
                    orderController.completeSale(orderId).then(() => {
                        wx.showToast({ title: '售出成功', icon: 'success' });
                        this.loadPublishList();
                    }).catch(() => {
                        wx.showToast({ title: '操作失败', icon: 'none' });
                    });
                }
            });
        })
        .catch((err) => {
            console.error('获取待确认订单失败:', err);
            wx.showToast({ title: '获取订单信息失败', icon: 'none' });
        });
  },

  goPublish: function () {
    wx.switchTab({
      url: '/pages/publish/publish'
    });
  },

  onPullDownRefresh: function () {
    this.loadPublishList();
    wx.stopPullDownRefresh();
  }
});