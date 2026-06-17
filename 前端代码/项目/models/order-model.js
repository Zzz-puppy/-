import { HttpUtil } from '../utils/http-util.js';
import { DateUtil } from '../utils/date-util.js';
import { ProductModel } from './product-model.js';

const ORDER_STATUS = {
  0: { value: 'pending', text: '待确认', className: 'pending' },
  1: { value: 'review', text: '已完成', className: 'review' },
  2: { value: 'cancelled', text: '已下架', className: 'completed' }
};

export class OrderModel {
  constructor() {
    this.httpUtil = new HttpUtil();
    this.productModel = new ProductModel();
  }

  async getOrders(status = 'all') {
    const allOrders = await this.getAllOrders();
    if (status === 'all') return allOrders;
    return allOrders.filter(order => order.status === status);
  }

  async getAllOrders() {
    try {
      const data = await this.httpUtil.get('/api/order/my');
      const list = Array.isArray(data) ? data : [];
      const orders = list.map((order, index) => this.normalizeOrder(order, index));
      return this.hydrateOrderItems(orders);
    } catch (error) {
      console.error('我的订单接口不可用:', error.message);
      return [];
    }
  }

  async createOrder(params) {
    return this.httpUtil.post('/api/order', {
      itemId: Number(params.itemId || params.goodsId)
    });
  }

  async hydrateOrderItems(orders) {
    const detailCache = {};
    const result = [];

    for (const order of orders) {
      if (!order.itemId || (order.totalAmount && order.items[0] && order.items[0].title !== `商品 #${order.itemId}`)) {
        result.push(order);
        continue;
      }

      try {
        if (!detailCache[order.itemId]) {
          detailCache[order.itemId] = await this.productModel.getDetail(order.itemId);
        }
        const item = detailCache[order.itemId];
        result.push({
          ...order,
          totalAmount: Number(item.price || order.totalAmount || 0),
          items: [{
            id: item.id,
            goodsId: item.id,
            title: item.title,
            price: Number(item.price || 0),
            count: 1,
            image: item.coverImage || ''
          }]
        });
      } catch (error) {
        result.push(order);
      }
    }

    return result;
  }

  async updateStatus(orderId, status) {
    return this.httpUtil.put(`/api/order/${orderId}/status`, { status });
  }

  async cancelOrder(orderId) {
    return this.updateStatus(orderId, 2);
  }

  async getSellerOrders() {
    try {
      const data = await this.httpUtil.get('/api/order/seller');
      const list = Array.isArray(data) ? data : [];
      const orders = list.map((order, index) => this.normalizeOrder(order, index));
      return this.hydrateOrderItems(orders);
    } catch (error) {
      console.error('获取卖家订单失败:', error.message);
      return [];
    }
  }

  async getPendingOrdersByItemId(itemId) {
    try {
      const data = await this.httpUtil.get(`/api/order/item/${itemId}/pending`);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('获取待确认订单失败:', error.message);
      return [];
    }
  }

  async completeSale(orderId) {
    return this.httpUtil.put(`/api/order/${orderId}/complete`, {});
  }

  normalizeOrder(order = {}, index = 0) {
    const id = Number(order.id || order.orderId || index + 1);
    const sourceItems = Array.isArray(order.items) ? order.items : [];
    const itemId = Number(order.itemId || (sourceItems[0] && sourceItems[0].goodsId) || 0);
    const statusCode = Number(order.status === undefined || order.status === null ? 0 : order.status);
    const status = ORDER_STATUS[statusCode] || ORDER_STATUS[0];
    const createTime = order.createTime || '';
    const title = order.itemTitle || order.title || (itemId ? `商品 #${itemId}` : '订单商品');
    const price = Number(order.price || order.totalAmount || 0);
    const image = order.imageUrl || order.coverImage || '';

    return {
      id,
      orderNo: order.orderNo || String(id).padStart(8, '0'),
      itemId,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      statusCode,
      status: status.value,
      statusText: status.text,
      statusClass: status.className,
      totalAmount: price,
      createTime: createTime ? DateUtil.format(createTime, 'YYYY-MM-DD HH:mm') : '',
      rawCreateTime: createTime,
      items: Array.isArray(order.items) && order.items.length
        ? order.items
        : [{ id: itemId || id, goodsId: itemId, title, price, count: 1, image }]
    };
  }
}