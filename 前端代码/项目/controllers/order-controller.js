import { OrderModel } from '../models/order-model.js';

export class OrderController {
  constructor() {
    this.orderModel = new OrderModel();
  }

  async getOrders(status = 'all') {
    try {
      const data = await this.orderModel.getOrders(status);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getAllOrders() {
    try {
      const data = await this.orderModel.getAllOrders();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async createOrder(params) {
    try {
      const result = await this.orderModel.createOrder(params);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async payOrder(orderId) {
    try {
      const result = await this.orderModel.payOrder(orderId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async cancelOrder(orderId) {
    try {
      const result = await this.orderModel.cancelOrder(orderId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async confirmReceive(orderId) {
    try {
      const result = await this.orderModel.confirmReceive(orderId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getSellerOrders() {
    try {
      const data = await this.orderModel.getSellerOrders();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getPendingOrdersByItemId(itemId) {
    try {
      return await this.orderModel.getPendingOrdersByItemId(itemId);
    } catch (error) {
      throw error;
    }
  }

  async completeSale(orderId) {
    try {
      return await this.orderModel.completeSale(orderId);
    } catch (error) {
      throw error;
    }
  }
}