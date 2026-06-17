import { OrderController } from '../../controllers/order-controller.js';

Page({
  data: {
    currentSection: 'buy',    // 'buy' = 我买到的, 'sell' = 我卖出的
    currentStatus: 'all',
    allOrders: [],
    orders: [],
    pendingSellCount: 0
  },

  onLoad: function (options) {
    // 如果从其他页面传入 section=sell，则默认显示卖家视图
    if (options && options.section === 'sell') {
      this.setData({ currentSection: 'sell' });
    }
    this.loadOrders();
  },

  onShow: function () {
    this.loadOrders();
  },

  switchSection: function (e) {
    const section = e.currentTarget.dataset.section;
    this.setData({
      currentSection: section,
      currentStatus: 'all'
    });
    this.loadOrders();
  },

  switchStatus: function (e) {
    const status = e.currentTarget.dataset.status;
    this.setData({
      currentStatus: status
    });
    this.loadOrders();
  },

  async loadOrders() {
    const orderController = new OrderController();
    try {
      if (this.data.currentSection === 'sell') {
        // 加载卖家订单
        const allOrders = await orderController.getSellerOrders();
        // 卖家不需要状态筛选，全部显示，但计算待处理数量
        const pendingCount = allOrders.filter(o => o.status === 'pending').length;
        this.setData({
          allOrders: allOrders,
          orders: allOrders,
          pendingSellCount: pendingCount
        });
      } else {
        // 加载买家订单
        const allOrders = await orderController.getAllOrders();
        const orders = this.filterOrders(allOrders, this.data.currentStatus);
        this.setData({
          allOrders: allOrders,
          orders: orders
        });
      }
    } catch (error) {
      console.error('加载订单失败:', error);
    }
  },

  filterOrders(orders, status) {
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status);
  },

  goDetail: function (e) {
    const goodsId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${goodsId}`
    });
  },

  cancelOrder: function (e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '取消订单',
      content: '确定取消该订单吗？',
      success: (res) => {
        if (res.confirm) {
          const orderController = new OrderController();
          orderController.cancelOrder(orderId)
            .then(() => {
              wx.showToast({ title: '已取消', icon: 'success' });
              this.loadOrders();
            })
            .catch(() => {
              wx.showToast({ title: '操作失败', icon: 'none' });
            });
        }
      }
    });
  },

  confirmSale: function (e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认售出',
      content: '确认已将该商品售出给该买家？',
      success: (res) => {
        if (res.confirm) {
          const orderController = new OrderController();
          orderController.completeSale(orderId)
            .then(() => {
              wx.showToast({ title: '售出成功', icon: 'success' });
              this.loadOrders();
            })
            .catch((err) => {
              console.error('确认售出失败:', err);
              wx.showToast({ title: '操作失败', icon: 'none' });
            });
        }
      }
    });
  },

  onPullDownRefresh: function () {
    this.loadOrders().finally(() => wx.stopPullDownRefresh());
  }
});